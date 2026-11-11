-- Autorização explícita da usuária recebida em 11/11/2026.
-- Mantém tabelas, dados e políticas RLS existentes.
BEGIN;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;

-- Chamado exclusivamente pelo servidor após validar a administradora.
-- Pedidos WhatsApp são intenções: a baixa ocorre na confirmação manual.
CREATE OR REPLACE FUNCTION public.hr_update_manual_order(
  p_order_id uuid,
  p_status text,
  p_restore_stock boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_payload jsonb;
  v_items jsonb;
  v_inventory jsonb;
  v_movements jsonb := '[]'::jsonb;
  v_product record;
  v_item record;
  v_product_count integer := 0;
  v_required_count integer;
  v_stock integer;
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('pendente', 'pago', 'cancelado') THEN
    RAISE EXCEPTION 'Status de pedido inválido.';
  END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado.'; END IF;
  IF lower(coalesce(v_order.payment_method, '')) = 'mercadopago'
    OR lower(coalesce(v_order.payment_provider, '')) = 'mercadopago' THEN
    RAISE EXCEPTION 'Este pagamento deve ser atualizado pelo Mercado Pago.';
  END IF;
  IF p_restore_stock AND p_status <> 'cancelado' THEN
    RAISE EXCEPTION 'A devolução de estoque exige um pedido cancelado.';
  END IF;
  IF v_order.payment_status = 'pago' AND p_status = 'pendente' THEN
    RAISE EXCEPTION 'Um pedido pago só pode ser cancelado, não voltar a pendente.';
  END IF;

  v_payload := CASE WHEN jsonb_typeof(v_order.items::jsonb) = 'array'
    THEN jsonb_build_object('items', v_order.items::jsonb)
    ELSE coalesce(v_order.items::jsonb, '{}'::jsonb) END;
  v_inventory := coalesce(v_payload->'inventory', '{}'::jsonb);

  IF p_status = 'pendente' AND v_inventory->>'state' = 'deducted' THEN
    RAISE EXCEPTION 'Confirme a devolução dos itens ao estoque antes de reabrir o pedido.';
  END IF;

  -- Repetir uma confirmação não gera outra baixa. Pagos antigos sem registro
  -- de estoque também não são debitados retroativamente.
  IF p_status = 'pago' AND coalesce(v_inventory->>'state', '') <> 'deducted'
     AND coalesce(v_order.payment_status, '') <> 'pago' THEN
    v_items := v_payload->'items';
    IF jsonb_typeof(v_items) IS DISTINCT FROM 'array' OR jsonb_array_length(v_items) = 0 THEN
      RAISE EXCEPTION 'O pedido não possui itens identificados para atualizar o estoque.';
    END IF;
    FOR v_item IN SELECT value AS item FROM jsonb_array_elements(v_items) LOOP
      IF coalesce(v_item.item->>'product_id', v_item.item->>'id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        OR coalesce(v_item.item->>'quantity', '') !~ '^[1-9][0-9]{0,5}$' THEN
        RAISE EXCEPTION 'Um item do pedido não possui produto ou quantidade válidos.';
      END IF;
    END LOOP;
    SELECT count(DISTINCT coalesce(value->>'product_id', value->>'id')) INTO v_required_count
      FROM jsonb_array_elements(v_items);
    -- A ordem por ID é igual em todos os pedidos, evitando inversão de travas.
    FOR v_product IN
      SELECT p.id, p.name, p.stock FROM public.products p
      WHERE p.id IN (SELECT coalesce(value->>'product_id', value->>'id')::uuid FROM jsonb_array_elements(v_items))
      ORDER BY p.id FOR UPDATE OF p
    LOOP
      SELECT sum((value->>'quantity')::integer)::integer INTO v_stock
        FROM jsonb_array_elements(v_items)
        WHERE coalesce(value->>'product_id', value->>'id')::uuid = v_product.id;
      IF coalesce(v_product.stock, 0) < v_stock THEN
        RAISE EXCEPTION 'Estoque insuficiente para %. Nenhum item foi descontado.', v_product.name;
      END IF;
      UPDATE public.products SET stock = stock - v_stock WHERE id = v_product.id;
      v_movements := v_movements || jsonb_build_array(jsonb_build_object('product_id', v_product.id, 'quantity', v_stock));
      v_product_count := v_product_count + 1;
    END LOOP;
    IF v_product_count <> v_required_count THEN
      RAISE EXCEPTION 'Um produto do pedido não existe mais. Nenhum item foi descontado.';
    END IF;
    v_inventory := jsonb_build_object('state', 'deducted', 'movements', v_movements, 'deducted_at', now());
  END IF;

  -- Cancelar não presume devolução física. A administradora deve confirmar
  -- explicitamente o retorno dos itens; repetição não duplica a entrada.
  IF p_restore_stock AND v_inventory->>'state' = 'deducted' THEN
    v_movements := v_inventory->'movements';
    v_product_count := 0;
    SELECT count(*) INTO v_required_count FROM jsonb_array_elements(v_movements);
    FOR v_product IN
      SELECT p.id FROM public.products p
      WHERE p.id IN (SELECT (value->>'product_id')::uuid FROM jsonb_array_elements(v_movements))
      ORDER BY p.id FOR UPDATE OF p
    LOOP
      SELECT (value->>'quantity')::integer INTO v_stock FROM jsonb_array_elements(v_movements)
        WHERE (value->>'product_id')::uuid = v_product.id;
      UPDATE public.products SET stock = coalesce(stock, 0) + v_stock WHERE id = v_product.id;
      v_product_count := v_product_count + 1;
    END LOOP;
    IF v_product_count <> v_required_count THEN
      RAISE EXCEPTION 'Não foi possível localizar todos os produtos para devolver o estoque.';
    END IF;
    v_inventory := v_inventory || jsonb_build_object('state', 'restored', 'restored_at', now());
  END IF;

  IF v_inventory <> '{}'::jsonb THEN
    v_payload := jsonb_set(v_payload, '{inventory}', v_inventory, true);
  END IF;
  IF p_status = 'pago' AND coalesce(v_order.payment_status, '') <> 'pago' THEN
    v_payload := jsonb_set(v_payload, '{checkout}', coalesce(v_payload->'checkout', '{}'::jsonb)
      || jsonb_build_object('event', 'confirmed', 'confirmed_at', now()), true);
  END IF;
  UPDATE public.orders SET payment_status = p_status, items = v_payload WHERE id = p_order_id;
  RETURN jsonb_build_object('order_id', p_order_id, 'payment_status', p_status, 'inventory', v_inventory);
END;
$$;
REVOKE ALL ON FUNCTION public.hr_update_manual_order(uuid, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hr_update_manual_order(uuid, text, boolean) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;

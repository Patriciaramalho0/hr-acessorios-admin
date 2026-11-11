# Estoque de pedidos WhatsApp

A migração `20261111_manual_inventory_and_description.sql` foi autorizada explicitamente e aplicada em 11/11/2026. Não recria tabelas, não apaga dados e não altera políticas RLS.

- O checkout cria uma intenção pendente, sem reservar nem baixar estoque.
- Ao confirmar o pagamento manual no painel, o servidor valida a administradora e chama uma função privada transacional. O banco bloqueia o pedido e os produtos, confere disponibilidade e baixa uma única vez.
- Duas confirmações concorrentes não conseguem consumir a mesma última unidade.
- Cancelar não significa que a mercadoria voltou fisicamente. Depois de cancelar, use a confirmação de devolução na página do pedido. A reposição acontece uma única vez.
- Pagamentos antigos já confirmados sem registro de movimentação não sofrem baixa retroativa.
- Uma edição de produto aberta antes de uma mudança de estoque é recusada para impedir sobrescrita da nova quantidade.
- O Mercado Pago permanece desativado; sua homologação com credenciais e tratamento de estoque do provedor são uma etapa posterior.

## Validação real

Em 11/11/2026 foram criados um produto técnico não publicado e dois pedidos identificados como teste, com `checkout.test_mode=true`. Foram verificados: acesso anônimo recusado, disputa concorrente por uma unidade, confirmação repetida, cancelamento sem reposição, devolução explícita e devolução repetida. Todos passaram. Os dois pedidos terminaram cancelados, o produto não publicado e seu estoque recomposto. Nenhum registro foi excluído. O dashboard desconsidera pedidos com a marca técnica.

O comprovante local está em `work-backup-release-20261111-1794422301696/inventory-validation.json`, fora do repositório. O backup anterior à alteração permanece nesse diretório.

O painel precisa de `SUPABASE_SERVICE_ROLE_KEY` no servidor, além das variáveis de autenticação e `ADMIN_USER_ID`. Nunca use prefixos públicos para a chave privada.

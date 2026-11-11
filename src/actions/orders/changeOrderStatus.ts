"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { ServerActionResponse } from "@/types/server-action";
import { createPrivilegedClient } from "@/lib/supabase/privileged.server";

export async function changeOrderStatus(
  orderId: string,
  newOrderStatus: string,
  restoreStock = false
): Promise<ServerActionResponse> {
  const status = newOrderStatus.trim();

  if (!orderId || !["pendente", "pago", "cancelado"].includes(status)) {
    return { dbError: "Pedido ou status inválido." };
  }

  const supabase = await createServerActionClient();
  const db = supabase as any;

  const { data: order, error: readError } = await db.from("orders").select("payment_method").eq("id", orderId).single();
  if (readError || !order) return { dbError: "Pedido não encontrado." };
  if (order.payment_method === "mercadopago") return { dbError: "O pagamento deste pedido é atualizado pelo Mercado Pago." };

  let error;
  try {
    ({ error } = await createPrivilegedClient().rpc("hr_update_manual_order", {
    p_order_id: orderId,
    p_status: status,
    p_restore_stock: restoreStock,
    }));
  } catch {
    return { dbError: "O serviço de estoque está indisponível. Tente novamente ou confira a configuração do servidor." };
  }

  if (error) {
    return { dbError: error.code === "P0001" ? error.message : "Não foi possível atualizar o pagamento e o estoque. Tente novamente." };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");

  return { success: true };
}

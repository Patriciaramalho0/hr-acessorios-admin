"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { ServerActionResponse } from "@/types/server-action";

export async function changeOrderStatus(
  orderId: string,
  newOrderStatus: string
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

  const { error } = await db
    .from("orders")
    .update({ payment_status: status })
    .eq("id", orderId);

  if (error) {
    console.error("Erro ao atualizar pagamento:", error);
    return { dbError: "Não foi possível atualizar o pagamento." };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");

  return { success: true };
}

"use server";

import { createServerActionClient } from "@/lib/supabase/server-action";
import { OrdersExport } from "@/services/orders/types";

export async function exportOrders(): Promise<
  { data: OrdersExport[] } | { error: string }
> {
  const supabase = await createServerActionClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("orders")
    .select(
      "id, customer_name, customer_phone, total_amount, payment_status, payment_method, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao exportar pedidos:", error);
    return { error: "Não foi possível exportar os pedidos." };
  }

  return {
    data: (data ?? []).map((order: any) => ({
      id: order.id,
      customer_name: order.customer_name ?? "",
      customer_phone: order.customer_phone ?? "",
      total_amount: Number(order.total_amount ?? 0),
      payment_status: order.payment_status ?? "pendente",
      payment_method: order.payment_method ?? "",
      created_at: order.created_at,
    })),
  };
}

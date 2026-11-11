import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { queryPaginatedTable } from "@/helpers/queryPaginatedTable";
import {
  Order,
  OrderDetails,
  OrderItem,
  FetchOrdersParams,
  FetchOrdersResponse,
} from "./types";

function normalizeItems(value: unknown): OrderItem[] {
  let source = value;

  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }

  if (source && !Array.isArray(source) && typeof source === "object") {
    const object = source as Record<string, unknown>;
    source = object.items ?? object.products ?? [];
  }

  if (!Array.isArray(source)) return [];

  return source.map((item: any) => ({
    name: String(
      item?.name ??
      item?.product_name ??
      item?.title ??
      item?.product?.name ??
      "Produto"
    ),
    quantity: Math.max(0, Number(item?.quantity ?? item?.qty ?? 1) || 1),
    unit_price: Math.max(
      0,
      Number(
        item?.unit_price ??
        item?.price ??
        item?.unitPrice ??
        item?.product?.price ??
        0
      ) || 0
    ),
  }));
}

function normalizeOrder(row: any): Order {
  return {
    id: String(row.id),
    checkout: typeof row.items === "object" && row.items !== null && !Array.isArray(row.items) ? row.items.checkout : undefined,
    customer_name: String(row.customer_name ?? "Cliente não informado"),
    customer_phone: String(row.customer_phone ?? ""),
    items: normalizeItems(row.items),
    total_amount: Number(row.total_amount ?? 0),
    payment_status: row.payment_status ?? "pendente",
    payment_method: row.payment_method ?? "",
    created_at: row.created_at,
  };
}

export async function fetchOrders(
  client: SupabaseClient<Database>,
  {
    page = 1,
    limit = 10,
    search,
    status,
    method,
    startDate,
    endDate,
  }: FetchOrdersParams
): Promise<FetchOrdersResponse> {
  const db = client as any;

  let query = db
    .from("orders")
    .select(
      "id, customer_name, customer_phone, items, total_amount, payment_status, payment_method, created_at",
      { count: "exact" }
    );

  if (search?.trim()) {
    const term = search.trim().replace(/[,%()]/g, "");
    query = query.or(
      `customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`
    );
  }

  if (status && status !== "all") {
    query = query.eq("payment_status", status);
  }

  if (method && method !== "all") {
    query = query.eq("payment_method", method);
  }

  if (startDate) {
    query = query.gte("created_at", `${startDate}T00:00:00`);
  }

  if (endDate) {
    const nextDay = new Date(`${endDate}T12:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    query = query.lt("created_at", nextDay.toISOString());
  }

  query = query.order("created_at", { ascending: false });

  const result = await queryPaginatedTable<any, "orders">({
    name: "orders",
    page,
    limit,
    query,
  });

  return {
    ...result,
    data: (result.data ?? []).map(normalizeOrder),
  };
}

export async function fetchOrderDetails(
  client: SupabaseClient<Database>,
  { id }: { id: string }
): Promise<{ order: OrderDetails }> {
  const db = client as any;

  const { data, error } = await db
    .from("orders")
    .select(
      "id, customer_name, customer_phone, items, total_amount, payment_status, payment_method, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar pedido:", error?.message);
    throw new Error("Não foi possível localizar este pedido.");
  }

  return {
    order: {
      ...normalizeOrder(data),
      items: normalizeItems(data.items),
    },
  };
}

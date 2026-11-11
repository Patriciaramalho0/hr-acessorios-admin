
import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/types/supabase";
import {
  Customer,
  FetchCustomersParams,
  FetchCustomersResponse,
  CustomerOrder,
} from "./types";

export async function fetchCustomers(
  client: SupabaseClient<Database>,
  { page = 1, limit = 10, search }: FetchCustomersParams
): Promise<FetchCustomersResponse> {
  const db = client as any;

  const { data, error } = await db
    .from("orders")
    .select("customer_name, customer_phone, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar clientes:", error.message);
    throw new Error(error.message);
  }

  const customersMap = new Map<string, Customer>();

  for (const order of data ?? []) {
    const name = String(order.customer_name ?? "").trim();
    const phone = String(order.customer_phone ?? "").trim();

    if (!name && !phone) continue;

    const id = phone || `name:${name.toLowerCase()}`;

    if (!customersMap.has(id)) {
      customersMap.set(id, {
        id,
        name: name || "Cliente sem nome",
        email: "",
        phone: phone || null,
        created_at: order.created_at,
      });
    }
  }

  let customers = Array.from(customersMap.values());

  if (search?.trim()) {
    const term = search.trim().toLowerCase();

    customers = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        (customer.phone ?? "").toLowerCase().includes(term)
    );
  }

  const totalItems = customers.length;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage =
    totalPages === 0 ? 1 : Math.max(1, Math.min(page, totalPages));

  const from = (currentPage - 1) * limit;

  return {
    data: customers.slice(from, from + limit),
    pagination: {
      limit,
      current: currentPage,
      items: totalItems,
      pages: totalPages,
      next: currentPage < totalPages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
  };
}

export async function fetchCustomerOrders(
  client: SupabaseClient<Database>,
  { id }: { id: string }
): Promise<{ customerOrders: CustomerOrder[] }> {
  const db = client as any;

  let query = db
    .from("orders")
    .select(
      "id, customer_name, customer_phone, created_at, payment_method, total_amount, payment_status, items"
    );

  if (id.startsWith("name:")) {
    query = query.eq("customer_name", id.slice(5));
  } else {
    query = query.eq("customer_phone", id);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Erro ao buscar pedidos do cliente:", error.message);
    throw new Error(error.message);
  }

  return {
    customerOrders: (data ?? []) as CustomerOrder[],
  };
}

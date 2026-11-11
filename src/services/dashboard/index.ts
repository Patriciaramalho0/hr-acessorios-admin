
import { createServerClient } from "@/lib/supabase/server";

export interface DashboardData {
  sales: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    allTime: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
    canceled: number;
  };
  weekly: {
    labels: string[];
    sales: number[];
    orders: number[];
  };
  bestSellers: {
    name: string;
    quantity: number;
  }[];
}

function getLocalDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeItems(value: unknown): {
  name: string;
  quantity: number;
}[] {
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
    quantity: Math.max(
      1,
      Number(item?.quantity ?? item?.qty ?? 1) || 1
    ),
  }));
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const empty: DashboardData = {
    sales: {
      today: 0,
      yesterday: 0,
      thisMonth: 0,
      lastMonth: 0,
      allTime: 0,
    },
    orders: {
      total: 0,
      pending: 0,
      paid: 0,
      canceled: 0,
    },
    weekly: {
      labels: [],
      sales: [],
      orders: [],
    },
    bestSellers: [],
  };

  try {
    const supabase = createServerClient();
    const db = supabase as any;

    const { data: rows, error } = await db
      .from("orders")
      .select(
        "id, items, total_amount, payment_status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) {
      console.error("Erro ao carregar dados do dashboard:", error.message);
      return empty;
    }

    const orders = (rows ?? []).filter((row: any) => row.items?.checkout?.test_mode !== true);
    const now = new Date();

    const today = getLocalDate(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = getLocalDate(yesterdayDate);

    const currentMonth = today.slice(0, 7);
    const previousMonthDate = new Date(now);
    previousMonthDate.setDate(1);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    const previousMonth = getLocalDate(previousMonthDate).slice(0, 7);

    const result = { ...empty };

    result.orders.total = orders.length;

    const weeklyDates: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      weeklyDates.push(getLocalDate(date));
    }

    const weeklySales = new Array(7).fill(0);
    const weeklyOrders = new Array(7).fill(0);
    const productTotals = new Map<string, number>();

    for (const order of orders) {
      const status = String(order.payment_status ?? "pendente")
        .trim()
        .toLowerCase();

      const amount = Number(order.total_amount ?? 0);
      const orderDate = getLocalDate(new Date(order.created_at));

      if (status === "pendente" || status === "pending") {
        result.orders.pending++;
      } else if (status === "cancelado" || status === "cancelled") {
        result.orders.canceled++;
      } else if (status === "pago" || status === "paid") {
        result.orders.paid++;

        result.sales.allTime += amount;

        if (orderDate === today) {
          result.sales.today += amount;
        }

        if (orderDate === yesterday) {
          result.sales.yesterday += amount;
        }

        if (orderDate.startsWith(currentMonth)) {
          result.sales.thisMonth += amount;
        }

        if (orderDate.startsWith(previousMonth)) {
          result.sales.lastMonth += amount;
        }

        const weekIndex = weeklyDates.indexOf(orderDate);

        if (weekIndex !== -1) {
          weeklySales[weekIndex] += amount;
        }

        for (const item of normalizeItems(order.items)) {
          productTotals.set(
            item.name,
            (productTotals.get(item.name) ?? 0) + item.quantity
          );
        }
      }

      const weekIndex = weeklyDates.indexOf(orderDate);

      if (weekIndex !== -1) {
        weeklyOrders[weekIndex]++;
      }
    }

    result.weekly = {
      labels: weeklyDates.map((date) => {
        const [, month, day] = date.split("-");
        return `${day}/${month}`;
      }),
      sales: weeklySales,
      orders: weeklyOrders,
    };

    result.bestSellers = Array.from(productTotals.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return result;
  } catch (error) {
    console.error("Erro inesperado no dashboard:", error);
    return empty;
  }
}


import { Pagination } from "@/types/pagination";

export type OrderStatus = string;
export type OrderMethod = string;

export interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
}

export interface SBOrder {
  checkout?: { event?: string; note?: string; source?: string; whatsapp_consent?: boolean; whatsapp_consent_at?: string | null };
  id: string;
  customer_name: string;
  customer_phone: string;
  items: unknown;
  total_amount: number;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string;
}

export type Order = SBOrder;

export interface OrderDetails extends SBOrder {
  items: OrderItem[];
}

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export interface FetchOrdersResponse {
  data: Order[];
  pagination: Pagination;
}

export type OrdersExport = {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  created_at: string;
};

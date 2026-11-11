
import { Pagination } from "@/types/pagination";
import { SBOrder } from "../orders/types";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCustomersResponse {
  data: Customer[];
  pagination: Pagination;
}

export type CustomerOrder = Pick<
  SBOrder,
  | "id"
  | "customer_name"
  | "customer_phone"
  | "created_at"
  | "payment_method"
  | "total_amount"
  | "payment_status"
>;

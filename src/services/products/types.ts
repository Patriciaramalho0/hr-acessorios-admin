
import { Pagination } from "@/types/pagination";

export type ProductStatus = "selling" | "out-of-stock";

export type SBProduct = {
  published: boolean;
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  stock: number | null;
  category_id: string | null;
  created_at: string;
};

export type Product = SBProduct & {
  categories: {
    name: string | null;
    slug: string | null;
  } | null;
};

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  priceSort?: string;
  status?: string;
  published?: boolean;
  dateSort?: string;
}

export interface FetchProductsResponse {
  data: Product[];
  pagination: Pagination;
}

export type ProductDetails = SBProduct & {
  categories: {
    name: string | null;
  } | null;
};

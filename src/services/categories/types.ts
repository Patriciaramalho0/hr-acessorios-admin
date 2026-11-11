
import { Pagination } from "@/types/pagination";

export type SBCategory = {
  published: boolean;
  id: string;
  name: string;
  slug: string | null;
  created_at: string | null;
};

export type Category = SBCategory;

export interface FetchCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCategoriesResponse {
  data: Category[];
  pagination: Pagination;
}

export type CategoryDropdown = Pick<SBCategory, "id" | "name" | "slug">;

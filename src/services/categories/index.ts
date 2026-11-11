
import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/types/supabase";
import {
  Category,
  CategoryDropdown,
  FetchCategoriesParams,
  FetchCategoriesResponse,
} from "./types";
import { queryPaginatedTable } from "@/helpers/queryPaginatedTable";

export async function fetchCategories(
  client: SupabaseClient<Database>,
  { page = 1, limit = 10, search }: FetchCategoriesParams
): Promise<FetchCategoriesResponse> {
  const db = client as any;

  let query = db
    .from("categories")
    .select("id, name, slug, created_at, published, image_url", { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  query = query.order("created_at", { ascending: false });

  return queryPaginatedTable<Category, "categories">({
    name: "categories",
    page,
    limit,
    query,
  });
}

export async function fetchCategoriesDropdown(
  client: SupabaseClient<Database>
): Promise<CategoryDropdown[]> {
  const db = client as any;

  const { data, error } = await db
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error("Erro ao buscar categorias:", error.message);
    throw new Error(error.message);
  }

  return data ?? [];
}


import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/types/supabase";
import { queryPaginatedTable } from "@/helpers/queryPaginatedTable";
import {
  Product,
  FetchProductsParams,
  FetchProductsResponse,
  ProductDetails,
} from "./types";

export async function fetchProducts(
  client: SupabaseClient<Database>,
  {
    page = 1,
    limit = 10,
    search,
    category,
    priceSort,
    status,
    dateSort,
  }: FetchProductsParams
): Promise<FetchProductsResponse> {
  const db = client as any;

  let query = db
    .from("products")
    .select(
      `
        id,
        name,
        description,
        price,
        old_price,
        image_url,
        stock,
        published,
        category_id,
        created_at,
        categories (
          name,
          slug
        )
      `,
      { count: "exact" }
    );

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (category) {
    query = query.eq("category_id", category);
  }

  if (status === "selling") {
    query = query.gt("stock", 0);
  } else if (status === "out-of-stock") {
    query = query.or("stock.eq.0,stock.is.null");
  }

  if (priceSort) {
    query = query.order("price", {
      ascending: priceSort === "lowest-first",
    });
  } else if (dateSort) {
    const [, direction] = dateSort.split("-");
    query = query.order("created_at", {
      ascending: direction === "asc",
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  return queryPaginatedTable<Product, "products">({
    name: "products",
    page,
    limit,
    query,
  });
}

export async function fetchProductDetails(
  client: SupabaseClient<Database>,
  { slug }: { slug: string }
): Promise<{ product: ProductDetails }> {
  const db = client as any;

  const { data, error } = await db
    .from("products")
    .select(
      `
        id,
        name,
        description,
        price,
        old_price,
        image_url,
        stock,
        published,
        category_id,
        created_at,
        categories (
          name
        )
      `
    )
    .eq("id", slug)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar produto:", error);
    throw new Error("Não foi possível encontrar este produto.");
  }

  return { product: data as ProductDetails };
}

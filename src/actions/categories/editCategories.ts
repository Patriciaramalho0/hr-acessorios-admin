
"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteCategories(
  categoryIds: string[]
): Promise<ServerActionResponse> {
  if (!categoryIds.length) {
    return { dbError: "Nenhuma categoria foi selecionada." };
  }

  const supabase = await createServerActionClient();
  const db = supabase as any;

  const { data: linkedProducts, error: countError } = await db
    .from("products")
    .select("category_id")
    .in("category_id", categoryIds);

  if (countError) {
    console.error(countError);
    return { dbError: "Não foi possível verificar os produtos vinculados." };
  }

  if (linkedProducts?.length) {
    const linkedIds = [
      ...new Set(linkedProducts.map((product: { category_id: string }) => product.category_id)),
    ];

    return {
      dbError: `Não é possível excluir. Existem produtos vinculados a ${linkedIds.length} das categorias selecionadas.`,
    };
  }

  const { error } = await db
    .from("categories")
    .delete()
    .in("id", categoryIds);

  if (error) {
    console.error(error);
    return { dbError: "Não foi possível excluir as categorias." };
  }

  revalidatePath("/categories");
  revalidatePath("/products");

  return { success: true };
}

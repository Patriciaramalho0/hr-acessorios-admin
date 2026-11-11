
"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteCategory(
  categoryId: string
): Promise<ServerActionResponse> {
  const supabase = await createServerActionClient();
  const db = supabase as any;

  const { count, error: countError } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (countError) {
    console.error(countError);
    return { dbError: "Não foi possível verificar os produtos vinculados." };
  }

  if ((count ?? 0) > 0) {
    return {
      dbError: "Esta categoria possui produtos vinculados e não pode ser excluída.",
    };
  }

  const { error } = await db
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    console.error(error);
    return { dbError: "Não foi possível excluir a categoria." };
  }

  revalidatePath("/categories");
  revalidatePath("/products");

  return { success: true };
}

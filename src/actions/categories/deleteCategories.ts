"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteCategories(
  categoryIds: string[]
): Promise<ServerActionResponse> {
  if (!categoryIds.length) return { success: true };

  const supabase = await createServerActionClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .in("id", categoryIds);

  if (error) {
    console.error("Failed to delete categories:", error);
    return { dbError: "Não foi possível excluir as categorias." };
  }

  revalidatePath("/categories");
  return { success: true };
}


"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { VServerActionResponse } from "@/types/server-action";

export async function editProducts(
  productIds: string[],
  formData: FormData
): Promise<VServerActionResponse> {
  if (!productIds.length) {
    return { dbError: "Nenhum produto foi selecionado." };
  }

  const category = String(formData.get("category") || "").trim();

  if (!category) {
    return { dbError: "Selecione uma categoria." };
  }

  const supabase = await createServerActionClient();
  const db = supabase as any;

  const { error } = await db
    .from("products")
    .update({ category_id: category })
    .in("id", productIds);

  if (error) {
    console.error("Erro ao editar produtos:", error);
    return {
      dbError: "Não foi possível atualizar os produtos selecionados.",
    };
  }

  revalidatePath("/products");
  revalidatePath("/");

  return { success: true };
}

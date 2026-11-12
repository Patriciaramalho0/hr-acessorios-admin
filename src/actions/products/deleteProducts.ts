"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteProducts(
  productIds: string[]
): Promise<ServerActionResponse> {
  if (!productIds.length) return { success: true };

  const supabase = await createServerActionClient();

  const { data, error: fetchError } = await supabase
    .from("products")
    .select("image_url")
    .in("id", productIds);

  if (fetchError) {
    console.error("Failed to fetch products:", fetchError);
    return { dbError: "Não foi possível localizar os produtos." };
  }

  // Preservar arquivos: a exclusão do registro pode falhar e a imagem pode ser compartilhada.

  const { error } = await supabase
    .from("products")
    .delete()
    .in("id", productIds);

  if (error) {
    console.error("Failed to delete products:", error);
    return { dbError: "Não foi possível excluir os produtos." };
  }

  revalidatePath("/products");
  return { success: true };
}

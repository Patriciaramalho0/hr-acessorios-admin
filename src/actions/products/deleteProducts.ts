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

  const imageFileNames = (data ?? [])
    .map((product) => product.image_url)
    .filter((url): url is string => Boolean(url))
    .map((url) => `products/${url.split("/").pop()}`);

  if (imageFileNames.length) {
    const { error } = await supabase.storage
      .from("products")
      .remove(imageFileNames);

    if (error) console.error("Failed to delete product images:", error);
  }

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

"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { ServerActionResponse } from "@/types/server-action";

export async function deleteCoupons(
  couponIds: string[]
): Promise<ServerActionResponse> {
  if (!couponIds.length) return { success: true };

  const supabase = await createServerActionClient();

  const { data, error: fetchError } = await supabase
    .from("coupons")
    .select("image_url")
    .in("id", couponIds);

  if (fetchError) {
    console.error("Failed to fetch coupons:", fetchError);
    return { dbError: "Não foi possível localizar os cupons." };
  }

  const imageFileNames = (data ?? [])
    .map((coupon) => coupon.image_url)
    .filter((url): url is string => Boolean(url))
    .map((url) => `coupons/${url.split("/").pop()}`);

  if (imageFileNames.length) {
    const { error } = await supabase.storage
      .from("coupons")
      .remove(imageFileNames);

    if (error) console.error("Failed to delete coupon images:", error);
  }

  const { error } = await supabase
    .from("coupons")
    .delete()
    .in("id", couponIds);

  if (error) {
    console.error("Failed to delete coupons:", error);
    return { dbError: "Não foi possível excluir os cupons." };
  }

  revalidatePath("/coupons");
  return { success: true };
}


"use server";

import { revalidatePath } from "next/cache";

import { createServerActionClient } from "@/lib/supabase/server-action";
import { productFormSchema } from "@/app/(dashboard)/products/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { ProductServerActionResponse } from "@/types/server-action";

export async function editProduct(
  productId: string,
  formData: FormData
): Promise<ProductServerActionResponse> {
  const supabase = await createServerActionClient();
  const db = supabase as any;

  const imageValue = formData.get("image");

  const parsedData = productFormSchema.safeParse({
    name: formData.get("name"),
    image: imageValue || undefined,
    category: formData.get("category"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice") || 0,
    stock: formData.get("stock"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...productData } = parsedData.data;

  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    const fileExt = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `products/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, image);

    if (uploadError) {
      console.error("Erro ao enviar imagem:", uploadError);
      return { dbError: "Não foi possÃ­vel enviar a nova imagem." };
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(uploadData.path);

    imageUrl = publicUrlData.publicUrl;
  }

  const { data: updatedProduct, error: dbError } = await db
    .from("products")
    .update({
      name: productData.name,
      price: productData.price,
      old_price:
        productData.oldPrice != null && productData.oldPrice > 0
          ? productData.oldPrice
          : null,
      stock: productData.stock,
      category_id: productData.category,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq("id", productId)
    .select()
    .single();

  if (dbError) {
    console.error("Erro ao atualizar produto:", dbError);
    return {
      dbError: "Não foi possÃ­vel atualizar o produto. Tente novamente.",
    };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/");

  return { success: true, product: updatedProduct };
}



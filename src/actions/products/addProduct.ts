
"use server";

import { revalidatePath } from "next/cache";

import { createServerActionClient } from "@/lib/supabase/server-action";
import { productFormSchema } from "@/app/(dashboard)/products/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { ProductServerActionResponse } from "@/types/server-action";

export async function addProduct(
  formData: FormData
): Promise<ProductServerActionResponse> {
  const supabase = await createServerActionClient();
  const db = supabase as any;

  const imageValue = formData.get("image");

  const parsedData = productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
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

  let imageUrl: string | null = null;

  if (image instanceof File && image.size > 0) {
    const fileExt = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `products/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, image);

    if (uploadError) {
      console.error("Erro ao enviar imagem:", uploadError);
      return { dbError: "Não foi possÃ­vel enviar a imagem do produto." };
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(uploadData.path);

    imageUrl = publicUrlData.publicUrl;
  }

  const { data: newProduct, error: dbError } = await db
    .from("products")
    .insert({
      name: productData.name,
      description: productData.description || null,
      published: false,
      price: productData.price,
      old_price:
        productData.oldPrice != null && productData.oldPrice > 0
          ? productData.oldPrice
          : null,
      stock: productData.stock,
      category_id: productData.category,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Erro ao cadastrar produto:", dbError);
    return {
      dbError: "Não foi possÃ­vel cadastrar o produto. Tente novamente.",
    };
  }

  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, product: newProduct };
}



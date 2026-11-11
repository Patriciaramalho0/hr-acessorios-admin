
"use server";

import { revalidatePath } from "next/cache";

import { createServerActionClient } from "@/lib/supabase/server-action";
import { categoryFormSchema } from "@/app/(dashboard)/categories/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CategoryServerActionResponse } from "@/types/server-action";
import { prepareCategoryCover } from "@/lib/category-cover";

export async function addCategory(
  formData: FormData
): Promise<CategoryServerActionResponse> {
  const parsedData = categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    image: formData.get("image") ?? undefined,
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const supabase = await createServerActionClient();

  // O ID é gerado a partir do slug somente para novas categorias.
  // Os IDs das categorias existentes nunca são alterados.
  const categoryId = parsedData.data.slug;

  const db = supabase as any;
  let imageUrl: string | null | undefined;
  try {
    imageUrl = await prepareCategoryCover(supabase, parsedData.data.image, formData.get("remove_image") === "true");
  } catch (error) {
    return { dbError: error instanceof Error ? error.message : "Não foi possível enviar a capa." };
  }

  const { data: newCategory, error } = await db
    .from("categories")
    .insert({
      id: categoryId,
      name: parsedData.data.name,
      published: false,
      slug: parsedData.data.slug,
      image_url: imageUrl ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao cadastrar categoria:", error);

    if (error.code === "23505") {
      return {
        validationErrors: {
          slug: "Já existe uma categoria com esse identificador.",
        },
      };
    }

    return {
      dbError: "Não foi possível cadastrar a categoria.",
    };
  }

  revalidatePath("/categories");
  revalidatePath("/products");

  return {
    success: true,
    category: newCategory,
  };
}

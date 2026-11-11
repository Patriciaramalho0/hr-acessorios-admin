
"use server";

import { revalidatePath } from "next/cache";

import { createServerActionClient } from "@/lib/supabase/server-action";
import { categoryFormSchema } from "@/app/(dashboard)/categories/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CategoryServerActionResponse } from "@/types/server-action";
import { prepareCategoryCover } from "@/lib/category-cover";

export async function editCategory(
  categoryId: string,
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
  const db = supabase as any;
  let imageUrl: string | null | undefined;
  try {
    imageUrl = await prepareCategoryCover(supabase, parsedData.data.image, formData.get("remove_image") === "true");
  } catch (error) {
    return { dbError: error instanceof Error ? error.message : "Não foi possível enviar a capa." };
  }

  const { data: updatedCategory, error } = await db
    .from("categories")
    .update({
      name: parsedData.data.name,
      slug: parsedData.data.slug,
      ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
    })
    .eq("id", categoryId)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao editar categoria:", error);

    if (error.code === "23505") {
      return {
        validationErrors: {
          slug: "Já existe uma categoria com esse identificador.",
        },
      };
    }

    return {
      dbError: "Não foi possível atualizar a categoria.",
    };
  }

  revalidatePath("/categories");
  revalidatePath("/products");

  return {
    success: true,
    category: updatedCategory,
  };
}


import * as z from "zod";

export const categoryFormSchema = z.object({
  image: z.union([
    z.instanceof(File)
      .refine(file => file.size > 0 && file.size <= 3 * 1024 * 1024, "A imagem deve ter até 3 MB")
      .refine(file => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Use uma imagem JPG, PNG ou WebP"),
    z.string().url().refine(value => value.startsWith("https://"), "Use uma imagem HTTPS"),
  ]).nullish(),
  name: z
    .string()
    .trim()
    .min(1, "O nome da categoria é obrigatório")
    .max(100, "O nome deve ter no máximo 100 caracteres"),

  slug: z
    .string()
    .trim()
    .min(1, "O identificador da categoria é obrigatório")
    .max(100, "O identificador deve ter no máximo 100 caracteres")
    .regex(/^[a-z0-9-]+$/, {
      message: "Use apenas letras minúsculas, números e hífens",
    }),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

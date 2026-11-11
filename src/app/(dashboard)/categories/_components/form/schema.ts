
import * as z from "zod";

export const categoryFormSchema = z.object({
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

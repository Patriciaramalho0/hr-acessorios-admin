
import { z } from "zod";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const productFormSchema = z.object({
  description: z.string().trim().max(5000, "A descrição deve ter até 5.000 caracteres.").default(""),
  name: z
    .string()
    .min(1, "Informe o nome do produto.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),

  image: z
    .union([
      z.instanceof(File),
      z.string(),
    ])
    .optional()
    .refine(
      (value) =>
        !(value instanceof File) || value.size <= MAX_FILE_SIZE,
      "A imagem deve ter no máximo 3 MB."
    )
    .refine(
      (value) =>
        !(value instanceof File) ||
        ACCEPTED_IMAGE_TYPES.includes(value.type),
      "Formato inválido. Use JPG, PNG ou WEBP."
    ),

  category: z
    .string()
    .min(1, "Selecione uma categoria."),

  price: z.coerce
    .number()
    .positive("O preço deve ser maior que zero.")
    .finite("Informe um preço válido."),

  oldPrice: z.coerce
    .number()
    .min(0, "O preço anterior não pode ser negativo.")
    .finite("Informe um preço anterior válido.")
    .optional(),

  stock: z.coerce
    .number()
    .int("O estoque deve ser um número inteiro.")
    .min(0, "O estoque não pode ser negativo.")
    .finite("Informe uma quantidade válida."),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export const productBulkFormSchema = z.object({
  category: z
    .string()
    .min(1, "Selecione uma categoria."),
});

export type ProductBulkFormData = z.infer<
  typeof productBulkFormSchema
>;

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// A ausência de arquivo preserva a capa atual; remover exige uma ação explícita.
export async function prepareCategoryCover(
  client: Pick<SupabaseClient<Database>, "storage">,
  image: File | string | null | undefined,
  remove: boolean,
): Promise<string | null | undefined> {
  if (remove) return null;
  if (!(image instanceof File)) return undefined;
  if (image.size <= 0 || image.size > 3 * 1024 * 1024) throw new Error("A imagem deve ter até 3 MB.");
  const bytes = new Uint8Array(await image.arrayBuffer());
  const png = bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  const jpeg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.length >= 12 && Buffer.from(bytes.slice(0, 4)).toString() === "RIFF" && Buffer.from(bytes.slice(8, 12)).toString() === "WEBP";
  const extension = image.type === "image/png" && png ? "png" : image.type === "image/jpeg" && jpeg ? "jpg" : image.type === "image/webp" && webp ? "webp" : null;
  if (!extension) throw new Error("Arquivo inválido. Use uma imagem JPG, PNG ou WebP.");
  const bucket = client.storage.from("categories");
  const path = `covers/${crypto.randomUUID()}.${extension}`;
  const { error } = await bucket.upload(path, bytes, { contentType: image.type, upsert: false });
  if (error) throw new Error("Não foi possível enviar a capa. Confira a permissão de upload e tente novamente.");
  return bucket.getPublicUrl(path).data.publicUrl;
}

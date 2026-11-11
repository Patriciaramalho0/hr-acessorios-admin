/** @jest-environment node */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { prepareCategoryCover } from "./category-cover";
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]);
function storage(error: unknown = null) {
  const upload = jest.fn().mockResolvedValue({ error });
  const getPublicUrl = jest.fn((path: string) => ({ data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/categories/${path}` } }));
  const from = jest.fn(() => ({ upload, getPublicUrl }));
  const client = { storage: { from } } as unknown as Pick<SupabaseClient<Database>, "storage">;
  return { client, upload, from };
}
describe("capa de categoria", () => {
  test("envia imagem válida ao bucket existente com nome único", async () => {
    const { client, upload, from } = storage();
    const url = await prepareCategoryCover(client, new File([png], "foto.png", { type: "image/png" }), false);
    expect(from).toHaveBeenCalledWith("categories");
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^covers\/[\da-f-]+\.png$/), expect.any(Uint8Array), { contentType: "image/png", upsert: false });
    expect(url).toMatch(/^https:\/\/example\.supabase\.co\/storage/);
  });
  test("mantém a capa atual ao editar somente o nome", async () => {
    const { client, upload } = storage();
    expect(await prepareCategoryCover(client, undefined, false)).toBeUndefined();
    expect(await prepareCategoryCover(client, "https://example.com/existente.png", false)).toBeUndefined();
    expect(upload).not.toHaveBeenCalled();
  });
  test("remover capa só limpa o vínculo e não apaga arquivos", async () => {
    const { client, from } = storage();
    expect(await prepareCategoryCover(client, undefined, true)).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });
  test("recusa conteúdo disfarçado e arquivos grandes antes do upload", async () => {
    const { client, upload } = storage();
    await expect(prepareCategoryCover(client, new File(["<svg>"], "foto.png", { type: "image/png" }), false)).rejects.toThrow("Arquivo inválido");
    await expect(prepareCategoryCover(client, new File([new Uint8Array(3 * 1024 * 1024 + 1)], "foto.png", { type: "image/png" }), false)).rejects.toThrow("3 MB");
    expect(upload).not.toHaveBeenCalled();
  });
  test("não retorna URL quando o Storage recusa o envio", async () => {
    const { client } = storage({ message: "denied" });
    await expect(prepareCategoryCover(client, new File([png], "foto.png", { type: "image/png" }), false)).rejects.toThrow("permissão");
  });
});

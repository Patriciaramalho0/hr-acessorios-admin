import { editCategory } from "./editCategory";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { prepareCategoryCover } from "@/lib/category-cover";
jest.mock("@/lib/supabase/server-action", () => ({ createServerActionClient: jest.fn() }));
jest.mock("@/lib/category-cover", () => ({ prepareCategoryCover: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
function form() { const data = new FormData(); data.set("name", "Óculos de sol"); data.set("slug", "oculos"); return data; }
describe("salvar capa da categoria", () => {
  let update: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    update = jest.fn(() => ({ eq: jest.fn(() => ({ select: () => ({ single: async () => ({ data: { id: "óculos", name: "Óculos de sol" }, error: null }) }) })) }));
    (createServerActionClient as jest.Mock).mockResolvedValue({ from: () => ({ update }) });
    (prepareCategoryCover as jest.Mock).mockResolvedValue(undefined);
  });
  test("não substitui a capa quando somente nome/identificador mudam", async () => {
    expect(await editCategory("óculos", form())).toHaveProperty("success", true);
    expect(update).toHaveBeenCalledWith({ name: "Óculos de sol", slug: "oculos" });
  });
  test("persiste a nova URL depois do upload", async () => {
    (prepareCategoryCover as jest.Mock).mockResolvedValue("https://example.com/nova.png");
    await editCategory("óculos", form());
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ image_url: "https://example.com/nova.png" }));
  });
  test("limpa a capa apenas quando solicitado", async () => {
    (prepareCategoryCover as jest.Mock).mockResolvedValue(null);
    const data = form(); data.set("remove_image", "true");
    await editCategory("óculos", data);
    expect(prepareCategoryCover).toHaveBeenCalledWith(expect.anything(), undefined, true);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ image_url: null }));
  });
  test("não atualiza a categoria se o upload falhar", async () => {
    (prepareCategoryCover as jest.Mock).mockRejectedValue(new Error("Falha no envio"));
    expect(await editCategory("óculos", form())).toEqual({ dbError: "Falha no envio" });
    expect(update).not.toHaveBeenCalled();
  });
  test("não envia arquivo nem atualiza banco sem autorização administrativa", async () => {
    (createServerActionClient as jest.Mock).mockRejectedValue(new Error("Acesso administrativo não autorizado."));
    await expect(editCategory("óculos", form())).rejects.toThrow("não autorizado");
    expect(prepareCategoryCover).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

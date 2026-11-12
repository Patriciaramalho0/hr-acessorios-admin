import { deleteProduct } from "./deleteProduct";
import { deleteProducts } from "./deleteProducts";
import { createServerActionClient } from "@/lib/supabase/server-action";
jest.mock("@/lib/supabase/server-action", () => ({ createServerActionClient: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

test.each([false, true])("preserva imagens quando a exclusão do produto falha (lote: %s)", async bulk => {
  const remove = jest.fn();
  const failure = async () => ({ error: { message: "Produto vinculado" } });
  (createServerActionClient as jest.Mock).mockResolvedValue({
    storage: { from: () => ({ remove }) },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { image_url: "https://example.com/products/p.png" }, error: null }) }), in: async () => ({ data: [{ image_url: "https://example.com/products/p.png" }], error: null }) }),
      delete: () => ({ eq: failure, in: failure }),
    }),
  });
  const result = bulk ? await deleteProducts(["produto"]) : await deleteProduct("produto");
  expect(result).toHaveProperty("dbError");
  expect(remove).not.toHaveBeenCalled();
});

import { changeOrderStatus } from "./changeOrderStatus";
import { createServerActionClient } from "@/lib/supabase/server-action";
jest.mock("@/lib/supabase/server-action", () => ({ createServerActionClient: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
describe("alteração administrativa de pagamento", () => {
  beforeEach(() => jest.clearAllMocks());
  test("recusa status fora da lista antes de acessar o banco", async () => {
    expect(await changeOrderStatus("pedido", "inventado")).toHaveProperty("dbError");
    expect(createServerActionClient).not.toHaveBeenCalled();
  });
  test("não permite substituir a confirmação do Mercado Pago", async () => {
    const update = jest.fn();
    (createServerActionClient as jest.Mock).mockResolvedValue({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { payment_method: "mercadopago" }, error: null }) }) }), update }) });
    expect(await changeOrderStatus("pedido", "pago")).toHaveProperty("dbError");
    expect(update).not.toHaveBeenCalled();
  });
  test("permite confirmação manual de WhatsApp pela administradora autorizada", async () => {
    const update = jest.fn().mockReturnValue({ eq: async () => ({ error: null }) });
    (createServerActionClient as jest.Mock).mockResolvedValue({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { payment_method: "whatsapp" }, error: null }) }) }), update }) });
    expect(await changeOrderStatus("pedido", "pago")).toEqual({ success: true });
    expect(update).toHaveBeenCalledWith({ payment_status: "pago" });
  });
});

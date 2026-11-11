import { changeOrderStatus } from "./changeOrderStatus";
import { createServerActionClient } from "@/lib/supabase/server-action";
import { createPrivilegedClient } from "@/lib/supabase/privileged.server";
jest.mock("@/lib/supabase/privileged.server", () => ({ createPrivilegedClient: jest.fn() }));
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
    const update = jest.fn();
    const rpc = jest.fn().mockResolvedValue({ error: null });
    (createPrivilegedClient as jest.Mock).mockReturnValue({ rpc });
    (createServerActionClient as jest.Mock).mockResolvedValue({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { payment_method: "whatsapp" }, error: null }) }) }), update }) });
    expect(await changeOrderStatus("pedido", "pago")).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("hr_update_manual_order", { p_order_id: "pedido", p_status: "pago", p_restore_stock: false });
    expect(update).not.toHaveBeenCalled();
  });
  test("informa falta de estoque e não retorna sucesso", async () => {
    (createServerActionClient as jest.Mock).mockResolvedValue({ from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { payment_method: "whatsapp" }, error: null }) }) }) }) });
    (createPrivilegedClient as jest.Mock).mockReturnValue({ rpc: jest.fn().mockResolvedValue({ error: { code: "P0001", message: "Estoque insuficiente." } }) });
    expect(await changeOrderStatus("pedido", "pago")).toEqual({ dbError: "Estoque insuficiente." });
  });
});

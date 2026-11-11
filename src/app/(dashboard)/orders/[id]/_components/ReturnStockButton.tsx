"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ActionAlertDialog } from "@/components/shared/ActionAlertDialog";
import { changeOrderStatus } from "@/actions/orders/changeOrderStatus";

export function ReturnStockButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  return <ActionAlertDialog title="Devolver os itens ao estoque?" description="Confirme somente se todos os itens deste pedido cancelado estão disponíveis fisicamente para venda novamente. A mesma devolução não será aplicada duas vezes." actionButtonText="Confirmar devolução" toastSuccessMessage="Estoque devolvido com sucesso." queryKey="orders" action={() => changeOrderStatus(orderId, "cancelado", true)} onSuccess={() => router.refresh()}>
    <Button variant="outline" className="mt-3 print:hidden">Devolver itens ao estoque</Button>
  </ActionAlertDialog>;
}

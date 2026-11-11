
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import PageTitle from "@/components/shared/PageTitle";
import Typography from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { fetchOrderDetails } from "@/services/orders";
import { createServerClient } from "@/lib/supabase/server";
import { InvoiceActions } from "./_components/InvoiceActions";
import { ReturnStockButton } from "./_components/ReturnStockButton";

type PageParams = {
  params: { id: string };
};

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

const dateLabel = (value: string) =>
  format(new Date(value), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });

export async function generateMetadata({
  params: { id },
}: PageParams): Promise<Metadata> {
  try {
    await fetchOrderDetails(createServerClient(), { id });

    return {
      title: "Detalhes do pedido | HR Acessórios",
    };
  } catch {
    return {
      title: "Pedido não encontrado | HR Acessórios",
    };
  }
}

export default async function Order({ params: { id } }: PageParams) {
  try {
    const { order } = await fetchOrderDetails(createServerClient(), { id });

    return (
      <section>
        <PageTitle className="print:hidden">
          Detalhes do pedido
        </PageTitle>

        <Card className="mb-8 p-4 text-muted-foreground lg:p-6 print:border-none print:bg-white print:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Typography
                variant="h2"
                className="mb-2 text-card-foreground"
              >
                HR Acessórios
              </Typography>

              <Badge variant="outline" className="capitalize">
                Pagamento: {order.payment_status || "Pendente"}
              </Badge>
            </div>

            <div className="text-sm md:text-right">
              <Typography className="font-semibold text-card-foreground">
                Pedido #{order.id.slice(0, 8).toUpperCase()}
              </Typography>

              <Typography>
                {dateLabel(order.created_at)}
              </Typography>
            </div>
          </div>

          <Separator className="my-6" />
          {order.inventory?.state === "deducted" && <p className="mb-3 text-sm">Itens descontados do estoque na confirmação deste pedido.</p>}
          {order.inventory?.state === "restored" && <p className="mb-3 text-sm">Itens devolvidos ao estoque.</p>}
          {order.payment_status === "cancelado" && order.inventory?.state === "deducted" && <ReturnStockButton orderId={order.id} />}

          {order.checkout && <div className="mb-6 space-y-1 text-sm">
            <p>Etapa: {order.payment_status === "pago" ? "Compra confirmada" : order.checkout.event === "whatsapp_redirected" ? "Redirecionamento ao WhatsApp iniciado" : "Checkout iniciado"}</p>
            <p>Origem: {order.checkout.source || "Não informada"}</p>
            {order.checkout.note && <p>Observação: {order.checkout.note}</p>}
            <p>Consentimento para ofertas pelo WhatsApp: {order.checkout.whatsapp_consent ? `Sim (${order.checkout.whatsapp_consent_at || "data não registrada"})` : "Não concedido"}</p>
          </div>}

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div>
              <Typography className="mb-1 font-semibold text-card-foreground">
                Dados do cliente
              </Typography>

              <Typography>{order.customer_name}</Typography>

              <Typography>
                {order.customer_phone || "Telefone não informado"}
              </Typography>
            </div>

            <div>
              <Typography className="mb-1 font-semibold text-card-foreground">
                Pagamento
              </Typography>

              <Typography>
                Forma: {order.payment_method || "Não informada"}
              </Typography>

              <Typography>
                Status: {order.payment_status || "Pendente"}
              </Typography>
            </div>
          </div>

          <Typography className="mb-3 font-semibold text-card-foreground">
            Itens do pedido
          </Typography>

          {order.items.length === 0 ? (
            <div className="rounded-md border p-4 text-sm">
              Não foi possível identificar os itens deste pedido no formato
              armazenado.
            </div>
          ) : (
            <div className="mb-8 overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">
                      Quantidade
                    </TableHead>
                    <TableHead className="text-right">
                      Preço unitário
                    </TableHead>
                    <TableHead className="text-right">
                      Subtotal
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={`${item.name}-${index}`}>
                      <TableCell>{item.name}</TableCell>

                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>

                      <TableCell className="text-right">
                        {currency(item.unit_price)}
                      </TableCell>

                      <TableCell className="text-right">
                        {currency(item.quantity * item.unit_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end border-t pt-5">
            <div className="min-w-52 text-right">
              <Typography className="text-sm text-muted-foreground">
                Total do pedido
              </Typography>

              <Typography className="text-2xl font-bold text-primary">
                {currency(Number(order.total_amount))}
              </Typography>
            </div>
          </div>
        </Card>

        <div className="print:hidden">
          <InvoiceActions order={order} />
        </div>
      </section>
    );
  } catch {
    return notFound();
  }
}


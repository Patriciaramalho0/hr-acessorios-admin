import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

import { OrderDetails } from "@/services/orders/types";

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

export default function InvoicePdfTemplate({
  order,
}: {
  order: OrderDetails;
}) {
  return (
    <Card
      id={`invoice-${order.id}`}
      className="rounded-none border-none bg-white p-12 text-black"
      style={{ width: "794px", minHeight: "900px" }}
    >
      <div className="flex justify-between gap-6">
        <div>
          <Typography variant="h2" className="text-black">
            HR Acessórios
          </Typography>
          <Typography className="mt-1 text-sm text-black">
            Resumo do pedido
          </Typography>
        </div>

        <div className="text-right">
          <Typography className="font-semibold text-black">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </Typography>
          <Typography className="text-sm text-black">
            {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
              locale: ptBR,
            })}
          </Typography>
        </div>
      </div>

      <Separator className="my-6 bg-gray-300" />

      <div className="mb-8">
        <Typography className="font-semibold text-black">
          Dados do cliente
        </Typography>
        <Typography className="text-black">{order.customer_name}</Typography>
        <Typography className="text-black">
          {order.customer_phone || "Telefone não informado"}
        </Typography>
      </div>

      <div className="mb-8">
        <Typography className="mb-2 font-semibold text-black">
          Itens do pedido
        </Typography>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-black">Produto</TableHead>
              <TableHead className="text-center text-black">
                Quantidade
              </TableHead>
              <TableHead className="text-right text-black">
                Valor unitário
              </TableHead>
              <TableHead className="text-right text-black">
                Subtotal
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={`${item.name}-${index}`}>
                <TableCell className="text-black">{item.name}</TableCell>
                <TableCell className="text-center text-black">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right text-black">
                  {currency(item.unit_price)}
                </TableCell>
                <TableCell className="text-right text-black">
                  {currency(item.quantity * item.unit_price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between gap-8">
        <div>
          <Typography className="font-semibold text-black">
            Informações de pagamento
          </Typography>
          <Typography className="text-black">
            Forma: {order.payment_method || "Não informada"}
          </Typography>
          <Typography className="text-black">
            Status: {order.payment_status || "Pendente"}
          </Typography>
        </div>

        <div className="text-right">
          <Typography className="text-sm text-black">
            Valor total
          </Typography>
          <Typography className="text-2xl font-bold text-black">
            {currency(Number(order.total_amount))}
          </Typography>
        </div>
      </div>
    </Card>
  );
}
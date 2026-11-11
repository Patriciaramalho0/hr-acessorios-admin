import Link from "next/link";
import { ZoomIn } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectItem } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableSelect } from "@/components/shared/table/TableSelect";
import { Order, OrderStatus } from "@/services/orders/types";
import { SkeletonColumn } from "@/types/skeleton";
import { changeOrderStatus } from "@/actions/orders/changeOrderStatus";
import { PrintInvoiceButton } from "./PrintInvoiceButton";
import { HasPermission } from "@/hooks/use-authorization";

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

const statusLabel = (status: string | null) => {
  const value = (status || "pendente").toLowerCase();

  if (value === "pago" || value === "paid") return "Pago";
  if (value === "cancelado" || value === "cancelled") return "Cancelado";
  if (value === "pendente" || value === "pending") return "Pendente";

  return status || "Pendente";
};

export const getColumns = ({
  hasPermission,
}: {
  hasPermission: HasPermission;
}) => {
  const columns: ColumnDef<Order>[] = [
    {
      header: "Cliente",
      cell: ({ row }) => (
        <div className="max-w-48">
          <p className="truncate font-medium">
            {row.original.customer_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.customer_phone || "Telefone não informado"}
          </p>
        </div>
      ),
    },
    {
      header: "Data do pedido",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "dd/MM/yyyy HH:mm", {
          locale: ptBR,
        }),
    },
    {
      header: "Pagamento",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.payment_method || "Não informado"}
        </span>
      ),
    },
    {
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold">
          {currency(Number(row.original.total_amount))}
        </span>
      ),
    },
    {
      header: "Status do pagamento",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {statusLabel(row.original.payment_status)}
        </Badge>
      ),
    },
    {
      header: "Detalhes",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {hasPermission("orders", "canPrint") && (
            <PrintInvoiceButton orderId={row.original.id} />
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground"
                asChild
              >
                <Link href={`/orders/${row.original.id}`}>
                  <ZoomIn className="size-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver pedido</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (hasPermission("orders", "canChangeStatus")) {
    columns.splice(5, 0, {
      header: "Atualizar pagamento",
      cell: ({ row }) => row.original.payment_method === "mercadopago" ? <span className="text-xs text-muted-foreground">Atualizado pelo provedor</span> : (
        <TableSelect
          value={row.original.payment_status || "pendente"}
          toastSuccessMessage="Status do pagamento atualizado."
          queryKey="orders"
          onValueChange={(value) =>
            changeOrderStatus(row.original.id, value as OrderStatus)
          }
        >
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="pago">Pago</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
        </TableSelect>
      ),
    });
  }

  return columns;
};

export const skeletonColumns: SkeletonColumn[] = [
  { header: "Cliente", cell: <Skeleton className="h-8 w-32" /> },
  { header: "Data do pedido", cell: <Skeleton className="h-8 w-28" /> },
  { header: "Pagamento", cell: <Skeleton className="h-8 w-20" /> },
  { header: "Total", cell: <Skeleton className="h-8 w-20" /> },
  { header: "Status", cell: <Skeleton className="h-8 w-20" /> },
  { header: "Detalhes", cell: <Skeleton className="h-8 w-20" /> },
];

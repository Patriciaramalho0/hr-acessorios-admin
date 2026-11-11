
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/helpers/formatAmount";

import Typography from "@/components/ui/typography";
import { OrderBadgeVariants } from "@/constants/badge";
import { CustomerOrder } from "@/services/customers/types";
import { HasPermission } from "@/hooks/use-authorization";

export const getColumns = ({
  hasPermission,
}: {
  hasPermission: HasPermission;
}) => {
  const columns: ColumnDef<CustomerOrder>[] = [
    {
      header: "Pedido",
      cell: ({ row }) => `#${row.original.id.slice(0, 8)}`,
    },
    {
      header: "Cliente",
      cell: ({ row }) => row.original.customer_name,
    },
    {
      header: "Data do pedido",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "dd/MM/yyyy HH:mm"),
    },
    {
      header: "Telefone",
      cell: ({ row }) => (
        <Typography>
          {row.original.customer_phone || "—"}
        </Typography>
      ),
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
      header: "Valor",
      cell: ({ row }) => formatAmount(row.original.total_amount),
    },
    {
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.payment_status || "pendente";

        return (
          <Badge
            variant={
              OrderBadgeVariants[
                status as keyof typeof OrderBadgeVariants
              ] ?? "secondary"
            }
            className="flex-shrink-0 text-xs capitalize"
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  return columns;
};

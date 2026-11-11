
import Link from "next/link";
import { ZoomIn } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Typography from "@/components/ui/typography";
import { TooltipWrapper } from "@/components/shared/table/TableActionTooltip";

import { Customer } from "@/services/customers/types";
import { SkeletonColumn } from "@/types/skeleton";

export const getColumns = (_options?: { hasPermission?: unknown }) => {
  const columns: ColumnDef<Customer>[] = [
    {
      header: "ID",
      cell: ({ row }) => (
        <Typography className="uppercase">
          {row.original.id.slice(-4)}
        </Typography>
      ),
    },
    {
      header: "Data do primeiro pedido",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "dd/MM/yyyy"),
    },
    {
      header: "Nome",
      cell: ({ row }) => row.original.name,
    },
    {
      header: "E-mail",
      cell: () => (
        <Typography className="text-muted-foreground">—</Typography>
      ),
    },
    {
      header: () => <span className="block text-center">Telefone</span>,
      id: "phone",
      cell: ({ row }) => (
        <Typography className="block text-center">
          {row.original.phone || "—"}
        </Typography>
      ),
    },
    {
      header: () => <span className="block text-center">Pedidos</span>,
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <TooltipWrapper content="Visualizar pedidos do cliente">
            <Button
              size="icon"
              asChild
              variant="ghost"
              className="text-foreground"
            >
              <Link
                href={`/customer-orders/${encodeURIComponent(row.original.id)}`}
              >
                <ZoomIn className="size-5" />
              </Link>
            </Button>
          </TooltipWrapper>
        </div>
      ),
    },
  ];

  return columns;
};

export const skeletonColumns: SkeletonColumn[] = [
  {
    header: "ID",
    cell: <Skeleton className="h-8 w-10" />,
  },
  {
    header: "Data do primeiro pedido",
    cell: <Skeleton className="h-8 w-20" />,
  },
  {
    header: "Nome",
    cell: <Skeleton className="h-8 w-24" />,
  },
  {
    header: "E-mail",
    cell: <Skeleton className="h-8 w-32" />,
  },
  {
    header: "Telefone",
    cell: <Skeleton className="h-10 w-20" />,
  },
  {
    header: "Pedidos",
    cell: <Skeleton className="h-8 w-10" />,
  },
];

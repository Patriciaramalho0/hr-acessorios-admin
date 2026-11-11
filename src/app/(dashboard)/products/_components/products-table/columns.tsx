import { TableSwitch } from "@/components/shared/table/TableSwitch";
import { toggleProductPublishedStatus } from "@/actions/products/toggleProductStatus";

import Link from "next/link";
import { ZoomIn, PenSquare, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Typography from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";

import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { SheetTooltip } from "@/components/shared/table/TableActionTooltip";
import { TableActionAlertDialog } from "@/components/shared/table/TableActionAlertDialog";
import ProductFormSheet from "../form/ProductFormSheet";

import { Product } from "@/services/products/types";
import { SkeletonColumn } from "@/types/skeleton";

import { editProduct } from "@/actions/products/editProduct";
import { deleteProduct } from "@/actions/products/deleteProduct";
import { HasPermission } from "@/hooks/use-authorization";

const formatBRL = (value: number | null | undefined) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
};

export const getColumns = ({
  hasPermission,
}: {
  hasPermission: HasPermission;
}) => {
  const columns: ColumnDef<Product>[] = [
    {
      header: "Produto",
      cell: ({ row }) => (
        <div className="flex min-w-40 items-center gap-2">
          <ImagePlaceholder
            src={row.original.image_url ?? ""}
            alt={row.original.name}
            width={40}
            height={40}
            className="size-10 rounded-md object-cover"
          />

          <Typography className="block truncate capitalize">
            {row.original.name}
          </Typography>
        </div>
      ),
    },
    {
      header: "Categoria",
      cell: ({ row }) => (
        <Typography className="block max-w-40 truncate">
          {row.original.categories?.name || "Sem categoria"}
        </Typography>
      ),
    },
    {
      header: "Preço anterior",
      cell: ({ row }) => {
        const oldPrice = row.original.old_price;

        return oldPrice && oldPrice > row.original.price ? (
          <span className="text-muted-foreground line-through">
            {formatBRL(oldPrice)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      header: "Preço atual",
      cell: ({ row }) => {
        const oldPrice = row.original.old_price;
        const price = row.original.price;

        const hasDiscount =
          oldPrice !== null && oldPrice > price;

        return (
          <div className="flex flex-col">
            <span className="font-semibold">{formatBRL(price)}</span>

            {hasDiscount && oldPrice > 0 && (
              <Badge variant="secondary" className="mt-1 w-fit">
                {Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: "Estoque",
      cell: ({ row }) => row.original.stock ?? 0,
    },
    {
      header: "Status",
      cell: ({ row }) => {
        const inStock = (row.original.stock ?? 0) > 0;

        return (
          <Badge variant={inStock ? "default" : "destructive"}>
            {inStock ? "Disponível" : "Sem estoque"}
          </Badge>
        );
      },
    },
    {
      header: "Visualizar",
      cell: ({ row }) => (
        <Button
          size="icon"
          asChild
          variant="ghost"
          className="text-foreground"
        >
          <Link href={`/products/${row.original.id}`}>
            <ZoomIn className="size-5" />
          </Link>
        </Button>
      ),
    },
  ];

  if (
    hasPermission("products", "canDelete") ||
    hasPermission("products", "canEdit")
  ) {
    columns.splice(0, 0, {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar produto"
        />
      ),
    });

    columns.push({
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {hasPermission("products", "canEdit") && (
            <ProductFormSheet
              key={row.original.id}
              title="Editar produto"
              description="Atualize as informações do produto."
              submitButtonText="Salvar alterações"
              actionVerb="atualizado"
              initialData={{
                name: row.original.name,
                description: row.original.description ?? "",
                image: row.original.image_url ?? undefined,
                category: row.original.category_id ?? "",
                price: row.original.price,
                oldPrice: row.original.old_price ?? 0,
                stock: row.original.stock ?? 0,
              }}
              action={(formData: FormData) =>
                editProduct(row.original.id, formData)
              }
              previewImage={row.original.image_url ?? ""}
              originalStock={row.original.stock}
            >
              <SheetTooltip content="Editar produto">
                <PenSquare className="size-5" />
              </SheetTooltip>
            </ProductFormSheet>
          )}

          {hasPermission("products", "canDelete") && (
            <TableActionAlertDialog
              title={`Excluir ${row.original.name}?`}
              description="Essa ação não pode ser desfeita. O produto será excluído permanentemente."
              tooltipContent="Excluir produto"
              actionButtonText="Excluir produto"
              toastSuccessMessage={`Produto "${row.original.name}" excluído com sucesso!`}
              queryKey="products"
              action={() => deleteProduct(row.original.id)}
            >
              <Trash2 className="size-5" />
            </TableActionAlertDialog>
          )}
        </div>
      ),
    });
  }

  columns.push({
    header: "Publicado na loja",
    cell: ({ row }) => hasPermission("products", "canTogglePublished") ? <TableSwitch checked={row.original.published} queryKey="products" toastSuccessMessage="Publicação atualizada." onCheckedChange={() => toggleProductPublishedStatus(row.original.id, row.original.published)} /> : <span>{row.original.published ? "Sim" : "Não"}</span>,
  });

  return columns;
};

export const skeletonColumns: SkeletonColumn[] = [
  {
    header: <Checkbox disabled checked={false} />,
    cell: <Skeleton className="size-4 rounded-sm" />,
  },
  {
    header: "Produto",
    cell: (
      <div className="flex items-center gap-2">
        <Skeleton className="size-10 rounded-md" />
        <Skeleton className="h-8 w-28" />
      </div>
    ),
  },
  {
    header: "Categoria",
    cell: <Skeleton className="h-8 w-32" />,
  },
  {
    header: "Preço anterior",
    cell: <Skeleton className="h-8 w-20" />,
  },
  {
    header: "Preço atual",
    cell: <Skeleton className="h-8 w-20" />,
  },
  {
    header: "Estoque",
    cell: <Skeleton className="h-8 w-20" />,
  },
  {
    header: "Status",
    cell: <Skeleton className="h-8 w-24" />,
  },
  {
    header: "Visualizar",
    cell: <Skeleton className="h-8 w-8" />,
  },
  {
    header: "Ações",
    cell: <Skeleton className="h-8 w-20" />,
  },
];

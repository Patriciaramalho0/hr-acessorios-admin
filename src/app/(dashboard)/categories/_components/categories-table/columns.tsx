import { TableSwitch } from "@/components/shared/table/TableSwitch";
import { toggleCategoryPublishedStatus } from "@/actions/categories/toggleCategoryStatus";

import { PenSquare, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

import { SheetTooltip } from "@/components/shared/table/TableActionTooltip";
import { TableActionAlertDialog } from "@/components/shared/table/TableActionAlertDialog";
import CategoryFormSheet from "../form/CategoryFormSheet";

import { Category } from "@/services/categories/types";
import { SkeletonColumn } from "@/types/skeleton";

import { editCategory } from "@/actions/categories/editCategory";
import { deleteCategory } from "@/actions/categories/deleteCategory";
import { HasPermission } from "@/hooks/use-authorization";

export const getColumns = ({
  hasPermission,
}: {
  hasPermission: HasPermission;
}) => {
  const columns: ColumnDef<Category>[] = [];

  if (
    hasPermission("categories", "canDelete") ||
    hasPermission("categories", "canEdit")
  ) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todas"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar categoria"
        />
      ),
    });
  }

  columns.push(
    {
      accessorKey: "name",
      header: "Categoria",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name.trim()}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Identificador",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.slug || "—"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Data de cadastro",
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString("pt-BR")
          : "—",
    }
  );

  if (
    hasPermission("categories", "canDelete") ||
    hasPermission("categories", "canEdit")
  ) {
    columns.push({
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {hasPermission("categories", "canEdit") && (
            <CategoryFormSheet
              key={row.original.id}
              title="Editar categoria"
              description="Altere o nome ou identificador da categoria."
              submitButtonText="Salvar alterações"
              actionVerb="atualizada"
              initialData={{
                name: row.original.name.trim(),
                slug: row.original.slug ?? "",
              }}
              action={(formData) => editCategory(row.original.id, formData)}
            >
              <SheetTooltip content="Editar categoria">
                <PenSquare className="size-5 cursor-pointer" />
              </SheetTooltip>
            </CategoryFormSheet>
          )}

          {hasPermission("categories", "canDelete") && (
            <TableActionAlertDialog
              title={`Excluir ${row.original.name.trim()}?`}
              description="A categoria só poderá ser excluída se não possuir produtos vinculados."
              tooltipContent="Excluir categoria"
              actionButtonText="Excluir categoria"
              toastSuccessMessage="Categoria excluída com sucesso."
              queryKey="categories"
              action={() => deleteCategory(row.original.id)}
            >
              <Trash2 className="size-5 cursor-pointer" />
            </TableActionAlertDialog>
          )}
        </div>
      ),
    });
  }

  columns.push({
    header: "Publicado na loja",
    cell: ({ row }) => hasPermission("categories", "canTogglePublished") ? <TableSwitch checked={row.original.published} queryKey="categories" toastSuccessMessage="Publicação atualizada." onCheckedChange={() => toggleCategoryPublishedStatus(row.original.id, row.original.published)} /> : <span>{row.original.published ? "Sim" : "Não"}</span>,
  });

  return columns;
};

export const skeletonColumns: SkeletonColumn[] = [
  {
    header: <Checkbox disabled checked={false} />,
    cell: <Skeleton className="size-4 rounded-sm" />,
  },
  {
    header: "Categoria",
    cell: <Skeleton className="w-32 h-8" />,
  },
  {
    header: "Identificador",
    cell: <Skeleton className="w-28 h-8" />,
  },
  {
    header: "Data de cadastro",
    cell: <Skeleton className="w-24 h-8" />,
  },
  {
    header: "Ações",
    cell: <Skeleton className="w-20 h-8" />,
  },
];


"use client";

import { Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SheetTrigger } from "@/components/ui/sheet";
import { ActionAlertDialog } from "@/components/shared/ActionAlertDialog";
import { ExportDataButtons } from "@/components/shared/ExportDataButtons";

import CategoryFormSheet from "./form/CategoryFormSheet";
import { addCategory } from "@/actions/categories/addCategory";
import { deleteCategories } from "@/actions/categories/deleteCategories";
import { exportCategories } from "@/actions/categories/exportCategories";
import { RowSelectionProps } from "@/types/data-table";
import { useAuthorization } from "@/hooks/use-authorization";

export default function CategoryActions({
  rowSelection,
  setRowSelection,
}: RowSelectionProps) {
  const { hasPermission } = useAuthorization();
  const selectedIds = Object.keys(rowSelection);

  return (
    <Card className="mb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
        <ExportDataButtons
          action={exportCategories}
          tableName="categories"
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          {hasPermission("categories", "canDelete") && (
            <ActionAlertDialog
              title={`Excluir ${selectedIds.length} categorias?`}
              description="Categorias com produtos vinculados não poderão ser excluídas."
              actionButtonText="Excluir categorias"
              toastSuccessMessage="Categorias excluídas com sucesso."
              queryKey="categories"
              action={() => deleteCategories(selectedIds)}
              onSuccess={() => setRowSelection({})}
            >
              <Button
                variant="destructive"
                size="lg"
                type="button"
                disabled={selectedIds.length === 0}
              >
                <Trash2 className="mr-2 size-4" />
                Excluir selecionadas
              </Button>
            </ActionAlertDialog>
          )}

          {hasPermission("categories", "canCreate") && (
            <CategoryFormSheet
              title="Nova categoria"
              description="Cadastre uma nova categoria para seus produtos."
              submitButtonText="Cadastrar categoria"
              actionVerb="cadastrada"
              action={addCategory}
            >
              <SheetTrigger asChild>
                <Button variant="default" size="lg">
                  <Plus className="mr-2 size-4" />
                  Nova categoria
                </Button>
              </SheetTrigger>
            </CategoryFormSheet>
          )}
        </div>
      </div>
    </Card>
  );
}

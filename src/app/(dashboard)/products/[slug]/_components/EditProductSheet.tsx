
"use client";

import { SheetTrigger } from "@/components/ui/sheet";
import { editProduct } from "@/actions/products/editProduct";
import { ProductDetails } from "@/services/products/types";
import ProductFormSheet from "../../_components/form/ProductFormSheet";
import { useAuthorization } from "@/hooks/use-authorization";

type Props = {
  product: ProductDetails;
  children: React.ReactNode;
};

export function EditProductSheet({ product, children }: Props) {
  const { hasPermission } = useAuthorization();

  if (!hasPermission("products", "canEdit")) return null;

  return (
    <ProductFormSheet
      title="Editar produto"
      description="Atualize as informações do produto."
      submitButtonText="Salvar alterações"
      actionVerb="atualizado"
      initialData={{
        name: product.name,
        description: product.description ?? "",
        image: product.image_url ?? undefined,
        category: product.category_id ?? "",
        price: product.price,
        oldPrice: product.old_price ?? 0,
        stock: product.stock ?? 0,
      }}
      action={(formData: FormData) =>
        editProduct(product.id, formData)
      }
      previewImage={product.image_url ?? ""}
      originalStock={product.stock}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
    </ProductFormSheet>
  );
}


"use client";

import {
  useRef,
  LegacyRef,
  useState,
  useTransition,
  useEffect,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

import {
  FormSheetContent,
  FormSheetBody,
  FormSheetHeader,
  FormSheetFooter,
} from "@/components/shared/form/FormSheet";

import {
  FormTextInput,
  FormCategoryInput,
  FormImageInput,
  FormPriceInput,
  FormTextarea,
} from "@/components/shared/form";

import { FormSubmitButton } from "@/components/shared/form/FormSubmitButton";

import { productFormSchema, ProductFormData } from "./schema";
import { objectToFormData } from "@/helpers/objectToFormData";
import { ProductServerActionResponse } from "@/types/server-action";

type BaseProductFormProps = {
  title: string;
  description: string;
  submitButtonText: string;
  actionVerb: string;
  children: React.ReactNode;
  action: (formData: FormData) => Promise<ProductServerActionResponse>;
};

type AddProductFormProps = BaseProductFormProps & {
  initialData?: never;
  previewImage?: never;
  originalStock?: never;
};

type EditProductFormProps = BaseProductFormProps & {
  initialData: Partial<ProductFormData>;
  previewImage: string;
  originalStock?: number | null;
};

type ProductFormProps = AddProductFormProps | EditProductFormProps;

export default function ProductFormSheet({
  title,
  description,
  submitButtonText,
  actionVerb,
  initialData,
  previewImage,
  originalStock,
  children,
  action,
}: ProductFormProps) {
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const imageDropzoneRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLButtonElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
      category: "",
      price: 0,
      oldPrice: 0,
      stock: 0,
      ...initialData,
    },
  });

  useEffect(() => {
    form.reset(initialData ?? {});
  }, [form, initialData]);

  const onSubmit = (data: ProductFormData) => {
    const formData = objectToFormData(data);
    if (initialData) formData.set("original_stock", originalStock === null ? "null" : String(originalStock ?? initialData.stock ?? 0));

    startTransition(async () => {
      try {
        const result = await action(formData);

        if ("validationErrors" in result) {
          Object.keys(result.validationErrors).forEach((key) => {
            form.setError(key as keyof ProductFormData, {
              message: result.validationErrors![key],
            });
          });

          const firstError = Object.keys(result.validationErrors)[0];

          if (firstError) {
            form.setFocus(firstError as keyof ProductFormData);
          }

          return;
        }

        if ("dbError" in result) {
          toast.error(result.dbError);
          return;
        }

        form.reset();

        toast.success(`Produto ${actionVerb} com sucesso!`, {
          position: "top-center",
        });

        await queryClient.invalidateQueries({
          queryKey: ["products"],
        });

        setIsSheetOpen(false);
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
        toast.error("Não foi possível salvar o produto.");
      }
    });
  };

  const onInvalid = (errors: FieldErrors<ProductFormData>) => {
    if (errors.image) {
      imageDropzoneRef.current?.focus();
    } else if (errors.category) {
      categoryRef.current?.focus();
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      {children}

      <SheetContent className="w-[90%] max-w-5xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="size-full"
          >
            <FormSheetContent>
              <FormSheetHeader>
                <div className="flex flex-col">
                  <SheetTitle>{title}</SheetTitle>
                  <SheetDescription>{description}</SheetDescription>
                </div>
              </FormSheetHeader>

              <FormSheetBody>
                <div
                  className="space-y-6"
                  ref={setContainer as LegacyRef<HTMLDivElement>}
                >
                  <FormTextInput
                    control={form.control}
                    name="name"
                    label="Nome do produto"
                    placeholder="Digite o nome do produto"
                  />

                  <FormTextarea control={form.control} name="description" label="Descrição" placeholder="Material, tamanho e cuidados com a peça" />

                  <FormImageInput
                    control={form.control}
                    name="image"
                    label="Imagem do produto"
                    previewImage={previewImage ?? ""}
                    ref={imageDropzoneRef}
                  />

                  <FormCategoryInput
                    control={form.control}
                    name="category"
                    label="Categoria"
                    container={container || undefined}
                    ref={categoryRef}
                  />

                  <FormPriceInput
                    control={form.control}
                    name="price"
                    label="Preço de venda"
                    placeholder="Preço do produto"
                  />

                  <FormPriceInput
                    control={form.control}
                    name="oldPrice"
                    label="Preço anterior"
                    placeholder="Preço anterior (opcional)"
                  />

                  <FormTextInput
                    control={form.control}
                    name="stock"
                    label="Quantidade em estoque"
                    placeholder="Quantidade"
                    type="number"
                  />
                </div>
              </FormSheetBody>

              <FormSheetFooter>
                <FormSubmitButton
                  isPending={isPending}
                  className="w-full"
                >
                  {submitButtonText}
                </FormSubmitButton>
              </FormSheetFooter>
            </FormSheetContent>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

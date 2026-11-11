
"use client";

import { useState, useTransition, useEffect } from "react";
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
  FormSlugInput,
} from "@/components/shared/form";

import { FormSubmitButton } from "@/components/shared/form/FormSubmitButton";

import { categoryFormSchema, CategoryFormData } from "./schema";
import { objectToFormData } from "@/helpers/objectToFormData";
import { CategoryServerActionResponse } from "@/types/server-action";

type Props = {
  title: string;
  description: string;
  submitButtonText: string;
  actionVerb: string;
  children: React.ReactNode;
  action: (formData: FormData) => Promise<CategoryServerActionResponse>;
  initialData?: Partial<CategoryFormData>;
};

export default function CategoryFormSheet({
  title,
  description,
  submitButtonText,
  actionVerb,
  initialData,
  children,
  action,
}: Props) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      ...initialData,
    },
  });

  useEffect(() => {
    if (isSheetOpen) {
      form.reset({
        name: "",
        slug: "",
        ...initialData,
      });
    }
  }, [isSheetOpen, initialData, form]);

  const onSubmit = (data: CategoryFormData) => {
    const formData = objectToFormData(data);

    startTransition(async () => {
      try {
        const result = await action(formData);

        if ("validationErrors" in result) {
          const errors = result.validationErrors ?? {};

          Object.keys(errors).forEach((key) => {
            form.setError(key as keyof CategoryFormData, {
              message: errors[key],
            });
          });

          const firstError = Object.keys(errors)[0];

          if (firstError) {
            form.setFocus(firstError as keyof CategoryFormData);
          }

          return;
        }

        if ("dbError" in result) {
          toast.error(result.dbError);
          return;
        }

        form.reset();
        toast.success(`Categoria ${actionVerb} com sucesso!`);
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsSheetOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível salvar a categoria.");
      }
    });
  };

  const onInvalid = (errors: FieldErrors<CategoryFormData>) => {
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      form.setFocus(firstError as keyof CategoryFormData);
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
                <div className="space-y-6">
                  <FormTextInput
                    control={form.control}
                    name="name"
                    label="Nome da categoria"
                    placeholder="Ex.: Colares"
                  />

                  <FormSlugInput
                    form={form}
                    control={form.control}
                    name="slug"
                    label="Identificador da categoria"
                    placeholder="Ex.: colares"
                    generateSlugFrom="name"
                  />
                </div>
              </FormSheetBody>

              <FormSheetFooter>
                <FormSubmitButton isPending={isPending} className="w-full">
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

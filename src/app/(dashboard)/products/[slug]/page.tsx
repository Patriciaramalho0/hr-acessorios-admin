
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import PageTitle from "@/components/shared/PageTitle";
import { ProductBadgeVariants } from "@/constants/badge";
import { EditProductSheet } from "./_components/EditProductSheet";

import { fetchProductDetails } from "@/services/products";
import { createServerClient } from "@/lib/supabase/server";

type PageParams = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params: { slug },
}: PageParams): Promise<Metadata> {
  try {
    const { product } = await fetchProductDetails(createServerClient(), {
      slug,
    });

    return { title: product.name };
  } catch {
    return { title: "Produto não encontrado" };
  }
}

export default async function ProductDetails({
  params: { slug },
}: PageParams) {
  try {
    const { product } = await fetchProductDetails(createServerClient(), {
      slug,
    });

    const stock = product.stock ?? 0;
    const categoryName = product.categories?.name ?? "Sem categoria";

    return (
      <section>
        <PageTitle className="lg:mb-10">Detalhes do produto</PageTitle>

        <div className="mb-6 flex flex-col gap-6 md:flex-row lg:gap-8">
          <div className="mx-auto w-full max-w-80 flex-shrink-0 md:mx-0 md:max-w-72 xl:max-w-80">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={320}
                height={320}
                priority
                className="aspect-square w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-muted text-muted-foreground">
                Sem imagem
              </div>
            )}
          </div>

          <div className="flex flex-col xl:pr-12">
            <div className="mb-2 flex items-center gap-x-2">
              <Typography component="p" className="font-semibold">
                Status:
              </Typography>

              <Badge
                variant={
                  ProductBadgeVariants[
                    stock > 0 ? "selling" : "out-of-stock"
                  ]
                }
                className="flex-shrink-0 text-xs"
              >
                {stock > 0 ? "Em estoque" : "Sem estoque"}
              </Badge>
            </div>

            <Typography variant="h1" className="mb-2">
              {product.name}
            </Typography>

            <Typography
              variant="h1"
              component="span"
              className="mb-1 text-3xl md:text-4xl"
            >
              {product.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Typography>

            {product.old_price != null && product.old_price > product.price && (
              <Typography className="mb-3 text-sm text-muted-foreground line-through">
                {product.old_price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Typography>
            )}

            <Typography component="p" className="mb-3">
              <Typography className="font-semibold">Estoque:</Typography>{" "}
              <Typography className="text-foreground/60">
                {stock} unidade(s)
              </Typography>
            </Typography>

            <Typography component="p" className="mb-6">
              <Typography className="font-semibold">Categoria:</Typography>{" "}
              <Typography className="text-foreground/60">
                {categoryName}
              </Typography>
            </Typography>

            <div>
              <EditProductSheet product={product}>
                <Button size="lg" className="w-auto text-base">
                  Editar produto
                </Button>
              </EditProductSheet>
            </div>
          </div>
        </div>
      </section>
    );
  } catch {
    return notFound();
  }
}

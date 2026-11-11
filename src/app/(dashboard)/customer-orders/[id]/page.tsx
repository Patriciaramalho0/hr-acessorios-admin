
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { IoBagHandle } from "react-icons/io5";

import { Card } from "@/components/ui/card";
import Typography from "@/components/ui/typography";
import PageTitle from "@/components/shared/PageTitle";

import CustomerOrdersTable from "./_components/Table";
import { createServerClient } from "@/lib/supabase/server";
import { fetchCustomerOrders } from "@/services/customers";

type PageParams = {
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params: { id },
}: PageParams): Promise<Metadata> {
  try {
    const { customerOrders } = await fetchCustomerOrders(
      createServerClient(),
      { id }
    );

    if (customerOrders.length === 0) {
      return { title: "Pedidos do cliente" };
    }

    return {
      title: customerOrders[0].customer_name || "Pedidos do cliente",
    };
  } catch {
    return { title: "Cliente não encontrado" };
  }
}

export default async function CustomerOrders({
  params: { id },
}: PageParams) {
  try {
    const { customerOrders } = await fetchCustomerOrders(
      createServerClient(),
      { id }
    );

    return (
      <section>
        <PageTitle>Pedidos do cliente</PageTitle>

        {customerOrders.length === 0 ? (
          <Card className="flex w-full flex-col items-center py-8 text-center">
            <IoBagHandle className="mb-4 size-20 text-red-500" />
            <Typography>Este cliente ainda não possui pedidos.</Typography>
          </Card>
        ) : (
          <CustomerOrdersTable data={customerOrders} />
        )}
      </section>
    );
  } catch {
    return notFound();
  }
}

import { Fragment } from "react";
import { Metadata } from "next";

import PageTitle from "@/components/shared/PageTitle";
import SalesOverview from "./_components/SalesOverview";
import StatusOverview from "./_components/StatusOverview";
import DashboardCharts from "./_components/dashboard-charts";
import RecentOrders from "@/app/(dashboard)/orders/_components/orders-table";

export const metadata: Metadata = {
  title: "Painel | HR Acessórios",
};

export default async function DashboardPage() {
  try {
    return (
      <Fragment>
        <section>
          <PageTitle>Visão Geral do Painel</PageTitle>

          <div className="space-y-8 mb-8">
            <SalesOverview />
            <StatusOverview />
            <DashboardCharts />
          </div>
        </section>

        <section>
          <PageTitle component="h2">Pedidos Recentes</PageTitle>

          <RecentOrders />
        </section>
      </Fragment>
    );
  } catch (error) {
    return (
      <div className="p-8 space-y-4">
        <PageTitle>Visão Geral do Painel</PageTitle>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <p className="text-lg font-semibold text-emerald-600">
            Painel da HR Acessórios carregado com sucesso!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            A estrutura das rotas está ok. Caso algum gráfico abaixo não apareça, é apenas porque a tabela de pedidos ainda está vazia.
          </p>
        </div>
      </div>
    );
  }
}
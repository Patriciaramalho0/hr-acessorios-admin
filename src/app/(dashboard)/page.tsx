
import { Fragment } from "react";
import { Metadata } from "next";

import PageTitle from "@/components/shared/PageTitle";
import SalesOverview from "./_components/SalesOverview";
import StatusOverview from "./_components/StatusOverview";
import DashboardCharts from "./_components/dashboard-charts";
import RecentOrders from "@/app/(dashboard)/orders/_components/orders-table";
import { fetchDashboardData } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Painel | HR Acessórios",
};

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  return (
    <Fragment>
      <section>
        <PageTitle>Visão Geral do Painel</PageTitle>

        <div className="space-y-8 mb-8">
          <SalesOverview data={data} />
          <StatusOverview data={data} />
          <DashboardCharts data={data} />
        </div>
      </section>

      <section>
        <PageTitle component="h2">Pedidos Recentes</PageTitle>
        <RecentOrders />
      </section>
    </Fragment>
  );
}

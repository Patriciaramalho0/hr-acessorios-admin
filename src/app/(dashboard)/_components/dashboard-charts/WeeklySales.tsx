
"use client";

import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Typography from "@/components/ui/typography";
import useGetMountStatus from "@/hooks/use-get-mount-status";
import type { DashboardData } from "@/services/dashboard";

export default function WeeklySales({ data }: { data: DashboardData }) {
  const { theme } = useTheme();
  const mounted = useGetMountStatus();

  const gridColor = `rgba(161, 161, 170, ${theme === "light" ? "0.5" : "0.3"})`;

  const currency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card>
      <Typography variant="h3" className="mb-4">
        Desempenho dos últimos 7 dias
      </Typography>

      <CardContent className="pb-2">
        <Tabs defaultValue="sales">
          <TabsList className="mb-6">
            <TabsTrigger value="sales" className="data-[state=active]:text-primary">
              Vendas
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:text-orange-500">
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="relative h-60">
            {mounted ? (
              data.weekly.sales.some((value) => value > 0) ? (
                <Line
                  data={{
                    labels: data.weekly.labels,
                    datasets: [
                      {
                        label: "Vendas",
                        data: data.weekly.sales,
                        borderColor: "rgb(34, 197, 94)",
                        backgroundColor: "rgb(34, 197, 94)",
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        border: { color: gridColor },
                        ticks: {
                          padding: 4,
                          callback: (value) => currency(Number(value)),
                        },
                      },
                      x: {
                        grid: { display: false },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `Vendas: ${currency(context.parsed.y)}`,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center pt-20">
                  Ainda não há vendas pagas nos últimos 7 dias.
                </p>
              )
            ) : (
              <Skeleton className="size-full" />
            )}
          </TabsContent>

          <TabsContent value="orders" className="relative h-60">
            {mounted ? (
              <Line
                data={{
                  labels: data.weekly.labels,
                  datasets: [
                    {
                      label: "Pedidos",
                      data: data.weekly.orders,
                      borderColor: "rgb(249, 115, 22)",
                      backgroundColor: "rgb(249, 115, 22)",
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: gridColor },
                      border: { color: gridColor },
                      ticks: { stepSize: 1, padding: 4 },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            ) : (
              <Skeleton className="size-full" />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

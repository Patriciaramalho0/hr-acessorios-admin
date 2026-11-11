
"use client";

import { Pie } from "react-chartjs-2";
import { useTheme } from "next-themes";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Typography from "@/components/ui/typography";
import useGetMountStatus from "@/hooks/use-get-mount-status";
import type { DashboardData } from "@/services/dashboard";

export default function BestSellers({ data }: { data: DashboardData }) {
  const mounted = useGetMountStatus();
  const { theme } = useTheme();

  return (
    <Card>
      <Typography variant="h3" className="mb-4">
        Produtos mais vendidos
      </Typography>

      <CardContent className="pb-2">
        <div className="relative h-[18.625rem]">
          {mounted ? (
            data.bestSellers.length > 0 ? (
              <Pie
                data={{
                  labels: data.bestSellers.map((product) => product.name),
                  datasets: [
                    {
                      label: "Unidades vendidas",
                      data: data.bestSellers.map((product) => product.quantity),
                      backgroundColor: [
                        "rgb(34, 197, 94)",
                        "rgb(59, 130, 246)",
                        "rgb(249, 115, 22)",
                        "rgb(99, 102, 241)",
                        "rgb(20, 184, 166)",
                      ],
                      borderColor:
                        theme === "light" ? "rgb(255,255,255)" : "rgb(23,23,23)",
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) =>
                          `${context.label}: ${context.parsed} unidades`,
                      },
                    },
                  },
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-20">
                Ainda não há produtos vendidos em pedidos pagos.
              </p>
            )
          ) : (
            <Skeleton className="size-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

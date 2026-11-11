
import {
  HiOutlineShoppingCart,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Typography from "@/components/ui/typography";
import { DashboardData } from "@/services/dashboard";

export default function StatusOverview({ data }: { data: DashboardData }) {
  const cards = [
    {
      icon: <HiOutlineShoppingCart />,
      title: "Total de pedidos",
      value: data.orders.total,
      className:
        "text-orange-600 dark:text-orange-100 bg-orange-100 dark:bg-orange-500",
    },
    {
      icon: <HiOutlineShoppingCart />,
      title: "Pedidos pendentes",
      value: data.orders.pending,
      className:
        "text-teal-600 dark:text-teal-100 bg-teal-100 dark:bg-teal-500",
    },
    {
      icon: <HiOutlineCheck />,
      title: "Pedidos pagos",
      value: data.orders.paid,
      className:
        "text-emerald-600 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-500",
    },
    {
      icon: <HiOutlineXMark />,
      title: "Pedidos cancelados",
      value: data.orders.canceled,
      className:
        "text-red-600 dark:text-red-100 bg-red-100 dark:bg-red-500",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="flex items-center gap-3 p-0">
            <div
              className={cn(
                "size-12 rounded-full grid place-items-center [&>svg]:size-5",
                card.className
              )}
            >
              {card.icon}
            </div>

            <div className="flex flex-col gap-y-1">
              <Typography className="text-sm text-muted-foreground">
                {card.title}
              </Typography>
              <Typography className="text-2xl font-semibold text-popover-foreground">
                {card.value}
              </Typography>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}




import {
  HiOutlineSquare3Stack3D,
  HiCalendarDays,
} from "react-icons/hi2";

import { cn } from "@/lib/utils";
import Typography from "@/components/ui/typography";
import { DashboardData } from "@/services/dashboard";

export default function SalesOverview({ data }: { data: DashboardData }) {
  const currency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const cards = [
    {
      icon: <HiOutlineSquare3Stack3D />,
      title: "Vendas de hoje",
      value: currency(data.sales.today),
      className: "bg-teal-600",
    },
    {
      icon: <HiOutlineSquare3Stack3D />,
      title: "Vendas de ontem",
      value: currency(data.sales.yesterday),
      className: "bg-orange-400",
    },
    {
      icon: <HiCalendarDays />,
      title: "Este mês",
      value: currency(data.sales.thisMonth),
      className: "bg-blue-500",
    },
    {
      icon: <HiCalendarDays />,
      title: "Mês anterior",
      value: currency(data.sales.lastMonth),
      className: "bg-cyan-600",
    },
    {
      icon: <HiCalendarDays />,
      title: "Vendas acumuladas",
      value: currency(data.sales.allTime),
      className: "bg-emerald-600",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className={cn(
            "p-6 rounded-lg flex flex-col items-center justify-center space-y-3 text-white text-center",
            card.className
          )}
        >
          <div className="[&>svg]:size-8">{card.icon}</div>
          <Typography className="text-base">{card.title}</Typography>
          <Typography className="text-xl font-semibold">
            {card.value}
          </Typography>
        </div>
      ))}
    </div>
  );
}




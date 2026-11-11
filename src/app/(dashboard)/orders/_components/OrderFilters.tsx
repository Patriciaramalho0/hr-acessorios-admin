
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DownloadCloud, Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/shared/DatePicker";

import { exportAsCSV } from "@/helpers/exportData";
import { exportOrders } from "@/actions/orders/exportOrders";

export default function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    method: searchParams.get("method") || "",
    startDate: searchParams.get("start-date") || "",
    endDate: searchParams.get("end-date") || "",
  });

  const handleOrdersDownload = () => {
    startTransition(async () => {
      const result = await exportOrders();

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      exportAsCSV(result.data, "pedidos-hr-acessorios");
      toast.success("Exportação concluída.");
    });
  };

  const handleFilter = (event: React.FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.status && filters.status !== "all") {
      params.set("status", filters.status);
    }

    if (filters.method && filters.method !== "all") {
      params.set("method", filters.method);
    }

    if (filters.startDate) {
      params.set("start-date", filters.startDate);
    }

    if (filters.endDate) {
      params.set("end-date", filters.endDate);
    }

    params.set("page", "1");
    params.set("limit", searchParams.get("limit") || "10");

    router.push(`/orders?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      status: "",
      method: "",
      startDate: "",
      endDate: "",
    });

    router.push("/orders");
  };

  return (
    <Card className="mb-5">
      <form onSubmit={handleFilter} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
          <Input
            type="search"
            placeholder="Buscar por nome ou telefone"
            className="h-12 md:basis-1/4"
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
          />

          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value })
            }
          >
            <SelectTrigger className="md:basis-1/4">
              <SelectValue placeholder="Status do pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.method}
            onValueChange={(value) =>
              setFilters({ ...filters, method: value })
            }
          >
            <SelectTrigger className="md:basis-1/4">
              <SelectValue placeholder="Forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={handleOrdersDownload}
            disabled={isPending}
            className="h-12 flex-shrink-0 md:basis-1/4"
          >
            Exportar pedidos
            {isPending ? (
              <Loader2 className="ml-2 size-4 animate-spin" />
            ) : (
              <DownloadCloud className="ml-2 size-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-4 lg:gap-6">
          <div className="md:basis-[35%]">
            <Label className="text-muted-foreground font-normal">
              Data inicial
            </Label>
            <DatePicker
              date={filters.startDate}
              setDate={(date) =>
                setFilters({ ...filters, startDate: date })
              }
            />
          </div>

          <div className="md:basis-[35%]">
            <Label className="text-muted-foreground font-normal">
              Data final
            </Label>
            <DatePicker
              date={filters.endDate}
              setDate={(date) =>
                setFilters({ ...filters, endDate: date })
              }
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-4 md:basis-[30%]">
            <Button type="submit" size="lg" className="h-12 flex-grow">
              Filtrar
            </Button>

            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="h-12 flex-grow"
              onClick={handleReset}
            >
              Limpar
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}


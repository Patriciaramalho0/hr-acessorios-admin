"use client";

import { DownloadCloud, Printer, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePdfDownload } from "@/hooks/use-pdf-download";
import { OrderDetails } from "@/services/orders/types";
import InvoicePdfTemplate from "./InvoicePdfTemplate";

export function InvoiceActions({ order }: { order: OrderDetails }) {
  const { isLoading, downloadTemplate } = usePdfDownload();

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = () => {
    downloadTemplate({
      htmlId: `invoice-${order.id}`,
      pdfName: `pedido-${order.id.slice(0, 8)}`,
    });
  };

  return (
    <>
      <div className="flex flex-wrap justify-between gap-3">
        <Button size="lg" disabled={isLoading} onClick={downloadInvoice}>
          {isLoading ? (
            <>
              Gerando PDF
              <Loader2 className="ml-2 size-4 animate-spin" />
            </>
          ) : (
            <>
              Baixar pedido em PDF
              <DownloadCloud className="ml-2 size-4" />
            </>
          )}
        </Button>

        <Button size="lg" variant="outline" onClick={printInvoice}>
          Imprimir pedido
          <Printer className="ml-2 size-4" />
        </Button>
      </div>

      <div className="pointer-events-none absolute -left-[9999px] -top-[9999px] opacity-0">
        <InvoicePdfTemplate order={order} />
      </div>
    </>
  );
}
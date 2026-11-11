import { getUser } from "@/helpers/getUser";

import { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme-provider";
import TanstackQueryProvider from "@/lib/tanstack-query-provider";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s | HR Acessórios",
    default: "HR Acessórios | Painel Administrativo",
  },
  description: "Painel administrativo da loja HR Acessórios.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TanstackQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <UserProvider user={user}>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </UserProvider>
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}

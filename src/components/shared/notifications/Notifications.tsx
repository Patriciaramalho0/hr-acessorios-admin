import { Bell } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationsBadge from "./NotificationsBadge";
import NotificationContent from "./NotificationContent";
import { getUser } from "@/helpers/getUser";

export default async function Notifications() {
  const user = await getUser();
  // Se o utilizador não estiver autenticado na sessão do servidor,
  // usamos um ID provisório ou vazio em vez de forçar um redirect indesejado.
  const staffId = user?.id || "helenzinha-id";

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Bell />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          alignOffset={-60}
          asChild
          className="flex flex-col p-0 w-[18rem] sm:w-[22rem]"
        >
          <ScrollArea type="auto" className="h-full max-h-[22rem]">
            <NotificationContent staffId={staffId} />
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <NotificationsBadge staffId={staffId} />
    </div>
  );
}
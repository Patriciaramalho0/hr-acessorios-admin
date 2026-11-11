
"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { X, Loader2, Bell } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import Typography from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Notification } from "@/services/notifications/types";
import { deleteNotification } from "@/services/notifications";
import { createBrowserClient } from "@/lib/supabase/client";

type Props = {
  notification: Notification;
};

export default function NotificationItem({ notification }: Props) {
  const queryClient = useQueryClient();

  const {
    mutate: handleDelete,
    isPending,
    isError,
  } = useMutation({
    mutationFn: () =>
      deleteNotification(createBrowserClient(), {
        notificationId: notification.id,
      }),
    onSuccess: () => {
      toast.success("Notificação excluída.");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível excluir a notificação.");
    }
  }, [isError]);

  return (
    <div className="flex items-center justify-between p-3 border-t border-t-border first:border-t-0 sm:gap-x-2">
      <div className="flex items-center gap-x-3">
        <div className="flex size-[1.875rem] items-center justify-center rounded-full bg-muted flex-shrink-0">
          <Bell className="size-4" />
        </div>

        <div className="flex flex-col">
          <Typography
            component="p"
            className="text-[0.8125rem] line-clamp-2 mb-2 sm:mb-1.5"
          >
            {notification.title}
          </Typography>

          <div className="flex flex-col-reverse items-start sm:items-center sm:flex-row gap-x-2 gap-y-2">
            {notification.type === "low_stock" ? (
              <Badge variant="destructive">Estoque baixo</Badge>
            ) : (
              <Badge variant="success">Novo pedido</Badge>
            )}

            <Typography component="p" className="text-xs">
              {format(
                new Date(notification.created_at),
                "dd/MM/yyyy - HH:mm"
              )}
            </Typography>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 w-8 h-8"
        disabled={isPending}
        onClick={() => handleDelete()}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <X className="size-3.5" />
        )}
      </Button>
    </div>
  );
}

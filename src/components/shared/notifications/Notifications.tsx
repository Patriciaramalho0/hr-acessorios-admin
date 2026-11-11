
import { Bell } from "lucide-react";

import { getUser } from "@/helpers/getUser";
import NotificationContent from "./NotificationContent";
import NotificationsBadge from "./NotificationsBadge";

export default async function Notifications() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center">
        <Bell className="size-5" />
        <NotificationsBadge staffId={user.id} />
      </div>

      <NotificationContent staffId={user.id} />
    </div>
  );
}

import { Bell } from "lucide-react";

interface Props {
  filter: "all" | "unread";
}

export function NotificationEmptyState({ filter }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
        <Bell className="size-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-base text-foreground">
          {filter === "unread" ? "All caught up!" : "No notifications yet"}
        </p>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
          {filter === "unread"
            ? "You have no unread notifications. Check back later."
            : "When you get orders, messages, or reviews, they'll show up here."}
        </p>
      </div>
    </div>
  );
}

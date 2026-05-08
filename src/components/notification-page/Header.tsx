import { CheckCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  unreadCount: number;
  filter: "all" | "unread";
  onSetFilter: (f: "all" | "unread") => void;
  onMarkAllRead: () => void;
  isLoading: boolean;
}

export function NotificationHeader({
  unreadCount,
  filter,
  onSetFilter,
  onMarkAllRead,
  isLoading,
}: Props) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="rounded-full px-2 py-0.5 text-xs bg-primary text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8"
            onClick={onMarkAllRead}
            disabled={isLoading}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => onSetFilter(v as "all" | "unread")}>
        <TabsList className="h-8 bg-muted/60 border border-border/50 rounded-lg p-0.5">
          <TabsTrigger value="all" className="h-7 text-xs rounded-md px-3">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="h-7 text-xs rounded-md px-3">
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] font-semibold text-primary">{unreadCount}</span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

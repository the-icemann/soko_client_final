import {
  Bell,
  CheckCircle2,
  Leaf,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  UserPlus,
  Users,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ── Map backend event types → icon + colour token ────────────────────────────

const EVENT_MAP: Record<string, { Icon: React.ElementType; bg: string; fg: string }> = {
  order_placed: {
    Icon: ShoppingCart,
    bg: "bg-sky-100 dark:bg-sky-900/40",
    fg: "text-sky-600 dark:text-sky-400",
  },
  payment_confirmed: {
    Icon: Wallet,
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    fg: "text-emerald-600 dark:text-emerald-400",
  },
  payment_failed: {
    Icon: XCircle,
    bg: "bg-red-100 dark:bg-red-900/40",
    fg: "text-red-600 dark:text-red-400",
  },
  order_dispatched: {
    Icon: Package,
    bg: "bg-amber-100 dark:bg-amber-900/40",
    fg: "text-amber-600 dark:text-amber-400",
  },
  order_delivered: {
    Icon: CheckCircle2,
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    fg: "text-emerald-600 dark:text-emerald-400",
  },
  order_cancelled: {
    Icon: XCircle,
    bg: "bg-red-100 dark:bg-red-900/40",
    fg: "text-red-500 dark:text-red-400",
  },
  new_message: {
    Icon: MessageSquare,
    bg: "bg-violet-100 dark:bg-violet-900/40",
    fg: "text-violet-600 dark:text-violet-400",
  },
  new_review: {
    Icon: Star,
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    fg: "text-yellow-600 dark:text-yellow-400",
  },
  new_follower: {
    Icon: UserPlus,
    bg: "bg-pink-100 dark:bg-pink-900/40",
    fg: "text-pink-600 dark:text-pink-400",
  },
  system: {
    Icon: Zap,
    bg: "bg-slate-100 dark:bg-slate-800",
    fg: "text-slate-500 dark:text-slate-400",
  },
  buyer_match: {
    Icon: Users,
    bg: "bg-green-100 dark:bg-green-900/40",
    fg: "text-green-600 dark:text-green-400",
  },
  listing_match: {
    Icon: Leaf,
    bg: "bg-teal-100 dark:bg-teal-900/40",
    fg: "text-teal-600 dark:text-teal-400",
  },
};

const FALLBACK = { Icon: Bell, bg: "bg-muted", fg: "text-muted-foreground" };

interface Props {
  type: string;
  className?: string;
  size?: "sm" | "md";
}

export function NotificationIcon({ type, className, size = "md" }: Props) {
  const { Icon, bg, fg } = EVENT_MAP[type] ?? FALLBACK;
  const box = size === "sm" ? "size-8" : "size-10";
  const icon = size === "sm" ? "size-4" : "size-5";

  return (
    <div className={cn("rounded-xl flex items-center justify-center shrink-0", box, bg, className)}>
      <Icon className={cn(icon, fg)} />
    </div>
  );
}

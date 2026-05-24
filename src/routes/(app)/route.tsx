import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  BarChart2,
  Download,
  Home,
  HomeIcon,
  MessageCircle,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { lazy, Suspense, useEffect } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import Navbar from "@/components/common/nav";
import { BottomNav, type BottomNavItem } from "@/components/navigation/bottom-navigation";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useNotificationsStore } from "@/store/notification-store";
import { useMessagesStore } from "@/store/useMessagesStore";

const SokoWebchat = lazy(() =>
  import("@/components/common/soko-webchat").then((m) => ({ default: m.SokoWebchat }))
);

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
});

function RouteComponent() {
  const unreadMessages = useMessagesStore((s) =>
    s.conversations.reduce((sum, c) => sum + c.unreadCount, 0)
  );
  const { unreadCount: unreadNotifications, fetchUnreadCount } = useNotificationsStore();
  const { canInstall, install } = usePWAInstall();

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const NAV_ITEMS: BottomNavItem[] = [
    {
      label: "Home",
      href: "/home",
      icon: <Home className="size-5" />,
      activeIcon: <HomeIcon className="size-5 fill-primary stroke-primary" />,
    },
    {
      label: "Market",
      href: "/marketplace",
      icon: <ShoppingBag className="size-5" />,
    },
    {
      label: "Search",
      href: "/search",
      icon: <Search className="size-5" />,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: <MessageCircle className="size-5" />,
      badge: unreadMessages,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="size-5" />,
      badge: unreadNotifications,
    },
    {
      label: "Prices",
      href: "/prices",
      icon: <BarChart2 className="size-5" />,
    },
    // Injected only when the app is installable
    ...(canInstall
      ? [
          {
            label: "Install",
            href: "#install",
            icon: <Download className="size-5" />,
          },
        ]
      : []),
  ];

  return (
    <div>
      <Navbar />
      <Outlet />
      <BottomNav
        items={NAV_ITEMS}
        onItemClick={(item) => {
          if (item.href === "#install") install();
        }}
      />
      <CartDrawer />
      <Suspense>
        <SokoWebchat />
      </Suspense>
    </div>
  );
}

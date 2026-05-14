import { Link, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  badge?: number;
}

interface BottomNavProps {
  items: BottomNavItem[];
  className?: string;
  onItemClick?: (item: BottomNavItem) => void;
}

const NavBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 size-4 bg-destructive text-[6px] font-bold text-foreground rounded-full flex items-center justify-center">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const BottomNavItem = ({
  item,
  isActive,
  onItemClick,
}: {
  item: BottomNavItem;
  isActive: boolean;
  onItemClick?: (item: BottomNavItem) => void;
}) => {
  const content = (
    <>
      <div className="relative">
        {isActive && item.activeIcon ? item.activeIcon : item.icon}
        {item.badge !== undefined && <NavBadge count={item.badge} />}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium leading-none transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {item.label}
      </span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
      )}
    </>
  );

  const sharedClass = cn(
    "relative flex flex-1 flex-col items-center justify-center gap-1 py-2",
    "text-muted-foreground transition-colors duration-200 hover:text-foreground",
    { "text-primary": isActive }
  );

  // Items with href="#..." are action items (e.g. install) — render as button
  if (item.href.startsWith("#")) {
    return (
      <button className={sharedClass} onClick={() => onItemClick?.(item)}>
        {content}
      </button>
    );
  }

  return (
    <Link to={item.href} className={sharedClass} onClick={() => onItemClick?.(item)}>
      {content}
    </Link>
  );
};

function BottomNav({ items, className, onItemClick }: BottomNavProps) {
  const pathName = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <nav
      data-slot="bottom-nav"
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50",
        "flex h-16 items-stretch",
        "border-t border-border bg-background/50 backdrop-blur-md",
        "pb-safe-bottom",
        className
      )}
    >
      {items.map((item) => (
        <BottomNavItem
          key={item.href}
          item={item}
          isActive={pathName === item.href}
          onItemClick={onItemClick}
        />
      ))}
    </nav>
  );
}

export { BottomNav, type BottomNavProps };

import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  BookOpen,
  Download,
  Home,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

import { Logo } from "../landing-page/logo";

interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_LINKS: NavLink[] = [
  { to: "/home", label: "Home", icon: <Home size={17} /> },
  { to: "/marketplace", label: "Marketplace", icon: <ShoppingCart size={17} /> },
  { to: "/blog", label: "Blog", icon: <BookOpen size={17} /> },
  { to: "/prices", label: "Prices", icon: <BarChart2 size={17} /> },
  { to: "/messages", label: "Messages", icon: <MessageCircle size={17} /> },
];

function DesktopNavLink({ link }: { link: NavLink }) {
  return (
    <Link
      to={link.to}
      activeProps={{ className: "border text-primary font-bold border-border bg-muted/50" }}
      inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-muted" }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150"
    >
      {({ isActive }) => (
        <>
          <span className={cn(isActive ? "text-primary" : "text-muted-foreground")}>
            {link.icon}
          </span>
          {link.label}
        </>
      )}
    </Link>
  );
}

function MobileNavLink({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  return (
    <div onClick={onNavigate}>
      <Link
        to={link.to}
        onClick={onNavigate}
        activeProps={{
          className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
        }}
        inactiveProps={{ className: "text-foreground hover:bg-muted" }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors w-full"
      >
        {({ isActive }) => (
          <>
            <span className={isActive ? "text-emerald-600" : "text-muted-foreground"}>
              {link.icon}
            </span>
            {link.label}
          </>
        )}
      </Link>
    </div>
  );
}

export default function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { getSummary } = useCartStore();
  const cartCount = getSummary().itemCount;
  const { user, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotifications();
  const { canInstall, install } = usePWAInstall();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Go to home">
          <Logo size="md" LogoStyle="text-foreground" dark />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <DesktopNavLink key={link.to} link={link} />
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Install — desktop only, shows when installable */}
          {canInstall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={install}
              className="hidden md:flex gap-1.5 rounded-[10px] h-9 px-3 text-muted-foreground hover:text-foreground"
            >
              <Download size={15} />
              Install
            </Button>
          )}

          {/* Search — desktop */}
          <Link to="/search" className="hidden md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-[10px] w-9 h-9 text-muted-foreground hover:text-foreground"
              aria-label="Search"
            >
              <Search size={15} />
            </Button>
          </Link>

          {/* Notifications — desktop */}
          <Link to="/user/notifications" className="hidden md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-[10px] w-9 h-9 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full ring-2 ring-background flex items-center justify-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Cart — desktop */}
          <Link to="/cart" className="hidden md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-[10px] w-9 h-9 text-muted-foreground hover:text-foreground"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-primary hover:bg-primary/60 text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-background">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Sell — desktop */}
          {(user?.role === "both" || user?.role === "farmer") && (
            <Link to="/sell" className="hidden md:flex">
              <Button
                size="sm"
                className="rounded-[10px] hover:bg-primary/60 active:scale-[0.97] font-semibold gap-1.5 shadow-sm h-9 px-4"
              >
                <Plus size={15} strokeWidth={2.5} />
                Sell
              </Button>
            </Link>
          )}

          {/* Avatar — desktop */}
          {isAuthenticated() ? (
            <Link to="/profile" className="hidden md:flex ml-0.5" aria-label="Profile">
              <Avatar className="w-9 h-9 ring-2 ring-primary cursor-pointer hover:ring-emerald-400 transition-all">
                <AvatarFallback className="text-xs font-bold">{user?.initials}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link to="/auth/sign-in" className="hidden md:flex ml-0.5" aria-label="Sign in">
              <Avatar className="w-9 h-9 ring-2 ring-primary cursor-pointer hover:ring-emerald-400 flex items-center justify-center transition-all">
                <User />
              </Avatar>
            </Link>
          )}

          {/* Notifications — mobile */}
          <Link to="/user/notifications" onClick={() => setSheetOpen(false)} className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-[10px] w-9 h-9 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full ring-2 ring-background flex items-center justify-center leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Cart — mobile */}
          <Link to="/cart" className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-[10px] w-9 h-9 text-muted-foreground"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 min-w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-background">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Mobile drawer */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-[10px] w-9 h-9 text-muted-foreground"
                aria-label={sheetOpen ? "Close menu" : "Open menu"}
              >
                {sheetOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 px-0 pt-0" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border">
                <Logo size="md" LogoStyle="text-foreground" />
              </div>

              <div className="px-3 py-3 space-y-0.5">
                {NAV_LINKS.map((link) => (
                  <MobileNavLink key={link.to} link={link} onNavigate={() => setSheetOpen(false)} />
                ))}
              </div>

              <Separator className="mx-4 my-1" />

              <div className="px-3 py-3 flex items-center gap-2">
                <div
                  className={`${isAuthenticated() ? "flex flex-col items-center" : "flex gap-2 items-center"}`}
                >
                  {isAuthenticated() ? (
                    <Link
                      to="/profile"
                      onClick={() => setSheetOpen(false)}
                      className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Avatar className="w-7.5 h-7.5 ring-2 ring-primary">
                        <AvatarFallback className="text-xs font-bold">
                          {user?.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">View profile</p>
                      </div>
                    </Link>
                  ) : (
                    <Link to="/auth/sign-in" onClick={() => setSheetOpen(false)}>
                      <Avatar className="w-7.5 h-7.5 ring-2 ring-primary">
                        <AvatarFallback className="text-xs font-bold">
                          <User />
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  )}
                  {(user?.role === "both" || user?.role === "farmer") && (
                    <Link to="/sell" onClick={() => setSheetOpen(false)}>
                      <Button
                        size="sm"
                        className="rounded-xl bg-primary hover:bg-primary/60 font-semibold shadow-sm h-10 px-8"
                      >
                        <Plus size={15} strokeWidth={2.5} />
                        Sell
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

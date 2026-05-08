import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  BookOpen,
  Home,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

import { Logo } from "../landing-page/logo";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavbarProps {
  cartCount?: number;
}

interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

// ─── Nav Links ────────────────────────────────────────────────────────────────
const NAV_LINKS: NavLink[] = [
  { to: "/home", label: "Home", icon: <Home size={17} /> },
  { to: "/marketplace", label: "Marketplace", icon: <ShoppingCart size={17} /> },
  { to: "/blog", label: "Blog", icon: <BookOpen size={17} /> },
  { to: "/prices", label: "Prices", icon: <BarChart2 size={17} /> },
  { to: "/messages", label: "Messages", icon: <MessageCircle size={17} /> },
  { to: "/ai", label: "AI Assistant", icon: <Sparkles size={17} /> },
];

// ─── NavLink item — desktop ───────────────────────────────────────────────────
function DesktopNavLink({ link }: { link: NavLink }) {
  return (
    <Link
      to={link.to}
      // This is the magic part:
      activeProps={{
        className: "border text-primary font-bold border-border bg-muted/50",
      }}
      // These are the "inactive" or base styles:
      inactiveProps={{
        className: "text-muted-foreground hover:text-foreground hover:bg-muted",
      }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150"
    >
      {/* To style the ICON specifically when active,
         TanStack Link provides a functional children pattern
      */}
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
// ─── NavLink item — mobile ────────────────────────────────────────────────────
function MobileNavLink({ link, onNavigate }: { link: NavLink; onNavigate: () => void }) {
  return (
    <Link
      to={link.to}
      onClick={onNavigate}
      activeProps={{
        className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      }}
      inactiveProps={{
        className: "text-foreground hover:bg-muted",
      }}
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
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { getSummary } = useCartStore();
  const cartCount = getSummary().itemCount;
  const { user } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Go to home">
          <Logo size="md" LogoStyle="text-foreground" dark />
        </Link>

        {/* ── Desktop nav links ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <DesktopNavLink key={link.to} link={link} />
          ))}
        </div>

        {/* ── Right actions ─────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link to="/search" className="hidden md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-[10px] w-9 h-9 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
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
          <Link to="/sell" className="hidden md:flex">
            <Button
              size="sm"
              className="rounded-[10px] hover:bg-primary/60 active:scale-[0.97] font-semibold gap-1.5 shadow-sm h-9 px-4"
            >
              <Plus size={15} strokeWidth={2.5} />
              Sell
            </Button>
          </Link>

          {/* Avatar — desktop */}
          <Link to="/profile" className="hidden md:flex ml-0.5" aria-label="Profile">
            <Avatar className="w-9 h-9 ring-2 ring-primary cursor-pointer hover:ring-emerald-400 transition-all">
              <AvatarFallback className="text-xs font-bold">{user?.initials}</AvatarFallback>
            </Avatar>
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
                <Badge className="absolute -top-1 -right-1  min-w-4 h-4  text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-background">
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

            <SheetContent side="right" className="w-72 px-0 pt-0">
              {/* Sheet header */}
              <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border">
                <Logo size="md" LogoStyle="text-foreground" />
              </div>

              {/* Nav links */}
              <div className="px-3 py-3 space-y-0.5">
                {NAV_LINKS.map((link) => (
                  <MobileNavLink key={link.to} link={link} onNavigate={() => setSheetOpen(false)} />
                ))}
              </div>

              <Separator className="mx-4 my-1" />

              {/* Bottom actions */}
              <div className="px-3 py-3 flex items-center gap-2">
                {/* Notifications */}
                <Link to="/user/notifications" onClick={() => setSheetOpen(false)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl w-10 h-10 text-muted-foreground"
                  >
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
                  </Button>
                </Link>

                <div className="flex flex-col items-center">
                  {/* Profile */}
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

                  {/* Sell */}
                  <Link to="/sell" onClick={() => setSheetOpen(false)}>
                    <Button
                      size="sm"
                      className="rounded-xl bg-primary hover:bg-primary/60  font-semibold  shadow-sm h-10 px-8"
                    >
                      <Plus size={15} strokeWidth={2.5} />
                      Sell
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

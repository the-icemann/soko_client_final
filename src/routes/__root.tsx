import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import { PWAUpdateBanner } from "@/components/common/pwa-update-banner";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export const Route = createRootRoute({
  component: RootComponent,
});

function PwaLinkInterceptor() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || !anchor.href) return;
      if (anchor.target === "_blank") return;
      try {
        const url = new URL(anchor.href);
        if (url.origin !== window.location.origin) return;
        e.preventDefault();
        navigate({ to: url.pathname + url.search + url.hash });
      } catch (_e) {
        // malformed URL — let through
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [navigate]);
  return null;
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <PwaLinkInterceptor />
        <Outlet />
        <PWAUpdateBanner />
        <TanStackRouterDevtools position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { lazy, Suspense } from "react";

import { PWAUpdateBanner } from "@/components/common/pwa-update-banner";
import { ThemeProvider } from "@/components/theme-provider";

const SokoWebchat = lazy(() =>
  import("@/components/common/soko-webchat").then((m) => ({ default: m.SokoWebchat }))
);

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

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Outlet />
        <Suspense>
          <SokoWebchat />
        </Suspense>
        <PWAUpdateBanner />
        <TanStackRouterDevtools position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

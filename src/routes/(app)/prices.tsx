import { createFileRoute, redirect } from "@tanstack/react-router";
import { BarChart2, Leaf, ShoppingBasket } from "lucide-react";

import { BuyerPricesView } from "@/components/prices-page/BuyerPricesView";
import { FarmerPricesView } from "@/components/prices-page/FarmerPricesView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";
import { usePricesStore } from "@/store/usePricesStore";

export const Route = createFileRoute("/(app)/prices")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) throw redirect({ to: "/auth/sign-in" });
  },
  component: PricesPage,
});

function PageHeader() {
  return (
    <div className="px-4 pt-6 pb-4 border-b border-border bg-background">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 className="size-5 text-primary" />
        <h1 className="text-lg font-bold tracking-tight">Market Intelligence</h1>
      </div>
      <p className="text-xs text-muted-foreground">
        AI-powered price predictions · transport cost analysis · sell-timing signals
      </p>
    </div>
  );
}

function FarmerSection() {
  return (
    <div className="px-4 py-5 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="size-4 text-green-600" />
        <h2 className="text-sm font-bold">Farmer Analytics</h2>
        <span className="text-[10px] bg-green-100 dark:bg-green-950/40 text-green-700 px-2 py-0.5 rounded-full font-semibold">
          For your listings
        </span>
      </div>
      <FarmerPricesView />
    </div>
  );
}

function BuyerSection() {
  return (
    <div className="px-4 py-5 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBasket className="size-4 text-blue-600" />
        <h2 className="text-sm font-bold">Market Price Overview</h2>
        <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
          All commodities
        </span>
      </div>
      <BuyerPricesView />
    </div>
  );
}

function PricesPage() {
  const isFarmer = useAuthStore((s) => s.isFarmer());
  const isBuyer = useAuthStore((s) => s.isBuyer());
  const isBoth = useAuthStore((s) => s.isBoth());

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <PageHeader />

      {isBoth ? (
        // Both roles — tabs
        <Tabs defaultValue="farmer" className="w-full">
          <div className="px-4 pt-4 sticky top-[3.5rem] z-10 bg-muted/20 backdrop-blur pb-0">
            <TabsList className="w-full">
              <TabsTrigger value="farmer" className="flex-1 gap-1.5">
                <Leaf className="size-3.5" /> Farmer Analytics
              </TabsTrigger>
              <TabsTrigger value="buyer" className="flex-1 gap-1.5">
                <ShoppingBasket className="size-3.5" /> Buyer Overview
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="farmer" className="mt-0">
            <FarmerSection />
          </TabsContent>
          <TabsContent value="buyer" className="mt-0">
            <BuyerSection />
          </TabsContent>
        </Tabs>
      ) : isFarmer ? (
        <FarmerSection />
      ) : isBuyer ? (
        <BuyerSection />
      ) : null}
    </div>
  );
}

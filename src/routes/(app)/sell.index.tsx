import { createFileRoute } from "@tanstack/react-router";

import { PhotoUploadStep } from "@/components/sell-page/photo-upload-step";
import { PricingStep } from "@/components/sell-page/pricing-step";
import { ProductInfoStep } from "@/components/sell-page/product-info-step";
import { PublishStep } from "@/components/sell-page/publish-step";
import { SellStepper } from "@/components/sell-page/sell-stepper";
import { useSellStore } from "@/store/sell-store";

export const Route = createFileRoute("/(app)/sell/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { draft, currentStep, goToStep, nextStep, prevStep, isStepValid } = useSellStore();

  // Steps completed = all steps before current that are valid
  const steps = ["info", "pricing", "photos", "publish"] as const;
  const currIdx = steps.indexOf(currentStep);
  const completed = steps.filter(
    (s, i) => i < currIdx && isStepValid(s)
  ) as (typeof steps)[number][];

  return (
    <div className="min-h-screen bg-background pt-4 pb-24 md:pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-serif">
            List Your Produce
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reach thousands of buyers across Uganda
          </p>
        </div>

        {/* Stepper */}
        <SellStepper currentStep={currentStep} completedSteps={completed} onStepClick={goToStep} />

        {/* Step content */}
        <div className="bg-card border border-border/60 rounded-2xl p-5 sm:p-7">
          {currentStep === "info" && <ProductInfoStep onNext={nextStep} />}
          {currentStep === "pricing" && <PricingStep onNext={nextStep} onBack={prevStep} />}
          {currentStep === "photos" && <PhotoUploadStep onNext={nextStep} onBack={prevStep} />}
          {currentStep === "publish" && <PublishStep onBack={prevStep} onGoToStep={goToStep} />}
        </div>

        {/* Draft saved note */}
        <p className="text-center text-[11px] text-muted-foreground">
          💾 Your draft is saved automatically — pick up where you left off anytime.
        </p>
      </div>
    </div>
  );
}

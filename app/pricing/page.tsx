import ChineseNamePricing from "@/components/product/pricing/chinese-name-pricing";

export const metadata = {
  title: "Pricing — BabyFilter",
  description: "Choose a plan: Free trial, monthly subscription, or credit pack. Safe, watermarked youth‑style mech filter for creators.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Pricing</h1>
            <p className="mt-4 text-muted-foreground">
              Start with a free trial or get the best value with our credit pack. Monthly subscribers get premium features and priority support.
            </p>
          </div>
        </div>
      </section>
      <ChineseNamePricing />
    </div>
  );
}


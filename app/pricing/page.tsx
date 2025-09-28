import ChineseNamePricing from "@/components/product/pricing/chinese-name-pricing";

export const metadata = {
  title: "Pricing — BabyFilter",
  description:
    "Signed-in users get 3 free generations/day. Choose Monthly (unlimited) or a 50 credits pack.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Pricing</h1>
            <p className="mt-4 text-muted-foreground">
              Signed-in users get 3 free generations per day. Subscribe for unlimited usage, or buy a 50 credits pack to pay as you go.
            </p>
          </div>
        </div>
      </section>
      <ChineseNamePricing />
    </div>
  );
}


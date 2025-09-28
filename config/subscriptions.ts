import { ProductTier } from "@/types/subscriptions";

export const SUBSCRIPTION_TIERS: ProductTier[] = [
  {
    name: "Monthly Card",
    id: "tier-monthly",
    productId: "prod_monthly_placeholder", // Use CREEM_SUBSCRIPTION_PRODUCT_ID_MONTHLY
    priceMonthly: "$9.99",
    description: "Unlimited generations with premium features.",
    features: [
      "Unlimited generations",
      "Premium personalization",
      "Save & manage favorites",
      "PDF export",
      "Priority support",
    ],
    featured: true,
    discountCode: "",
  },
];

export const CREDITS_TIERS: ProductTier[] = [
  {
    name: "50 Credits Pack",
    id: "tier-50-credits",
    productId: "prod_credits_50_placeholder", // Use CREEM_CREDITS_PRODUCT_ID_50
    priceMonthly: "$5",
    description: "One-time purchase, pay as you go.",
    creditAmount: 50,
    features: [
      "50 credits included",
      "Use anytime, no expiration",
      "Standard (1) & Premium (4) generations",
      "PDF export (1)"
    ],
    featured: true,
    discountCode: "",
  },
];

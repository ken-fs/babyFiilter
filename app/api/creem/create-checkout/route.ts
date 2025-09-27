import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createCheckoutSession } from "@/app/actions";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { productType, quantity } = body as {
      productType?: string;
      quantity?: number;
    };

    if (!productType) {
      return NextResponse.json(
        { error: "Missing productType" },
        { status: 400 }
      );
    }

    // Map incoming product type to Creem product and metadata
    if (productType === "chinese-name-credits") {
      const credits = typeof quantity === "number" && quantity > 0 ? quantity : 1000;
      const productId = process.env.CREEM_CREDITS_PRODUCT_ID_1000;

      if (!productId) {
        return NextResponse.json(
          {
            error:
              "Missing CREEM_CREDITS_PRODUCT_ID_1000. Please set this env var to your Creem product ID.",
          },
          { status: 500 }
        );
      }

      const checkoutUrl = await createCheckoutSession(
        productId,
        user.email || "",
        user.id,
        "credits",
        credits
      );

      return NextResponse.json({ checkoutUrl });
    }

    // Monthly subscription ($9.99/mo or your configured product)
    if (productType === "subscription_monthly") {
      const productId = process.env.CREEM_SUBSCRIPTION_PRODUCT_ID_MONTHLY;

      if (!productId) {
        return NextResponse.json(
          {
            error:
              "Missing CREEM_SUBSCRIPTION_PRODUCT_ID_MONTHLY. Please set this env var to your Creem subscription product ID.",
          },
          { status: 500 }
        );
      }

      const checkoutUrl = await createCheckoutSession(
        productId,
        user.email || "",
        user.id,
        "subscription"
      );

      return NextResponse.json({ checkoutUrl });
    }

    return NextResponse.json({ error: "Unsupported productType" }, { status: 400 });
  } catch (error) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

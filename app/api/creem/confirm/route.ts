import { NextResponse } from "next/server";
import { createOrUpdateCustomer, createOrUpdateSubscription, addCreditsToCustomer } from "@/utils/supabase/subscriptions";
import type { CreemCheckout, CreemCustomer } from "@/types/creem";

// Reconcile a checkout after redirect back from the payment page.
// Idempotent: relies on createOrUpdate* helpers and credits_history creem_order_id.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get("checkout_id") || searchParams.get("id");
    if (!checkoutId) {
      return NextResponse.json({ error: "Missing checkout_id" }, { status: 400 });
    }

    const apiBase = process.env.CREEM_API_URL;
    const apiKey = process.env.CREEM_API_KEY;

    if (!apiBase || !apiKey) {
      return NextResponse.json({ error: "CREEM_API_URL or CREEM_API_KEY not configured" }, { status: 500 });
    }

    const res = await fetch(`${apiBase}/checkouts/${checkoutId}`, {
      method: "GET",
      headers: { "x-api-key": apiKey },
      // Ensure we hit origin (no cache) because it is a post-payment check
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ error: "Failed to fetch checkout", details: text }, { status: 502 });
    }

    const payload = await res.json();
    // Try to normalize to CreemCheckout shape
    const checkout: CreemCheckout = (payload?.object?.object === "checkout")
      ? payload.object
      : (payload?.object || payload);

    if (!checkout || checkout.object !== "checkout") {
      return NextResponse.json({ error: "Unexpected checkout payload" }, { status: 500 });
    }

    // Basic state checks
    if (checkout.status !== "completed" && checkout.order?.status !== "paid") {
      // Not paid yet; return soft success so client can retry later
      return NextResponse.json({ ok: true, pending: true });
    }

    // Ensure customer linkage
    const customer: CreemCustomer = checkout.customer as any;
    const userId = checkout?.metadata?.user_id || checkout?.order?.metadata?.user_id;
    if (!userId) {
      return NextResponse.json({ error: "Missing user_id in checkout metadata" }, { status: 500 });
    }

    const customerId = await createOrUpdateCustomer(customer, userId);

    // Credits purchase
    const productType = checkout?.metadata?.product_type || checkout?.order?.metadata?.product_type;
    if (productType === "credits") {
      const credits = Number(checkout?.metadata?.credits || checkout?.order?.metadata?.credits || 0) || 0;
      if (credits > 0) {
        await addCreditsToCustomer(
          customerId,
          credits,
          checkout.order?.id,
          `Purchased ${credits} credits`
        );
      }
    }

    // Subscription
    if (checkout.subscription) {
      await createOrUpdateSubscription(checkout.subscription as any, customerId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Confirm checkout error:", error);
    return NextResponse.json({ error: "Checkout confirmation failed" }, { status: 500 });
  }
}


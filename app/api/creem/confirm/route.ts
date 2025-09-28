import { NextResponse } from "next/server";
import { createOrUpdateCustomer, createOrUpdateSubscription, addCreditsToCustomer } from "@/utils/supabase/subscriptions";
import type { CreemCheckout, CreemCustomer } from "@/types/creem";

// Reconcile a checkout after redirect back from the payment page.
// Idempotent: relies on createOrUpdate* helpers and credits_history creem_order_id.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get("checkout_id") || searchParams.get("id");
    const orderId = searchParams.get("order_id");
    const subscriptionId = searchParams.get("subscription_id");
    if (!checkoutId && !orderId && !subscriptionId) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    const apiBase = process.env.CREEM_API_URL;
    const apiKey = process.env.CREEM_API_KEY;

    if (!apiBase || !apiKey) {
      return NextResponse.json({ error: "CREEM_API_URL or CREEM_API_KEY not configured" }, { status: 500 });
    }

    const tryFetch = async (path: string) => {
      const r = await fetch(`${apiBase}${path}`, {
        method: "GET",
        headers: { "x-api-key": apiKey },
        cache: "no-store",
      });
      if (!r.ok) return null;
      return r.json();
    };

    // Try endpoints in order of reliability
    let payload: any = null;
    if (checkoutId) payload = await tryFetch(`/checkouts/${checkoutId}`);
    if (!payload && subscriptionId) payload = await tryFetch(`/subscriptions/${subscriptionId}`);
    if (!payload && orderId) payload = await tryFetch(`/orders/${orderId}`);

    if (!payload) {
      return NextResponse.json({ ok: true, pending: true }, { status: 200 });
    }

    // Normalize to one of the known objects
    const obj = payload?.object?.object ? payload.object : (payload?.object || payload);
    let checkout: CreemCheckout | null = null;
    let subscription: any = null;
    let order: any = null;
    if (obj?.object === "checkout") checkout = obj as CreemCheckout;
    else if (obj?.object === "subscription") subscription = obj;
    else if (obj?.object === "order") order = obj;

    // Basic state checks
    if (checkout && checkout.status !== "completed" && checkout.order?.status !== "paid") {
      // Not paid yet; return soft success so client can retry later
      return NextResponse.json({ ok: true, pending: true });
    }

    // Ensure customer linkage
    const customer: CreemCustomer | null = (checkout?.customer as any) || (subscription?.customer as any) || null;
    const userId = checkout?.metadata?.user_id || checkout?.order?.metadata?.user_id || subscription?.metadata?.user_id || order?.metadata?.user_id;
    if (!userId) {
      return NextResponse.json({ error: "Missing user_id in checkout metadata" }, { status: 500 });
    }

    if (!customer) {
      // In some callbacks we get only a string id in the query, skip reconcile until webhook
      return NextResponse.json({ ok: true, pending: true });
    }

    const customerId = await createOrUpdateCustomer(customer, userId);

    // Credits purchase
    const productType = checkout?.metadata?.product_type || checkout?.order?.metadata?.product_type || order?.metadata?.product_type;
    if (productType === "credits") {
      const credits = Number(checkout?.metadata?.credits || checkout?.order?.metadata?.credits || order?.metadata?.credits || 0) || 0;
      if (credits > 0) {
        await addCreditsToCustomer(
          customerId,
          credits,
          checkout?.order?.id || order?.id,
          `Purchased ${credits} credits`
        );
      }
    }

    // Subscription
    if (checkout?.subscription) {
      await createOrUpdateSubscription(checkout.subscription as any, customerId);
    } else if (subscription) {
      await createOrUpdateSubscription(subscription as any, customerId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Confirm checkout error:", error);
    return NextResponse.json({ error: "Checkout confirmation failed" }, { status: 500 });
  }
}

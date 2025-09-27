import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { verifyCreemWebhookSignature } from "@/utils/creem/verify-signature";
import { CreemWebhookEvent } from "@/types/creem";
import {
  createOrUpdateCustomer,
  createOrUpdateSubscription,
  addCreditsToCustomer,
} from "@/utils/supabase/subscriptions";
import type { CreemCustomer } from "@/types/creem";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const headersList = headers();
    const h = await headersList;
    const signature =
      h.get("creem-signature") ||
      h.get("x-creem-signature") ||
      h.get("signature") ||
      "";

    // Verify the webhook signature
    const valid = signature && verifyCreemWebhookSignature(body, signature, CREEM_WEBHOOK_SECRET);
    if (!valid) {
      if (process.env.DEBUG_CREEM_SIGNATURE === '1') {
        console.error("Invalid webhook signature", {
          haveHeaders: {
            'creem-signature': !!h.get("creem-signature"),
            'x-creem-signature': !!h.get("x-creem-signature"),
            'signature': !!h.get("signature"),
          },
          sigPrefix: signature?.slice(0, 12) || null,
          bodyLen: body.length,
        });
      }
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body) as CreemWebhookEvent;
    console.log("Received webhook event:", event.eventType, event.object?.id);

    // Handle different event types
    switch (event.eventType) {
      case "checkout.completed":
        await handleCheckoutCompleted(event);
        break;
      case "subscription.active":
        await handleSubscriptionActive(event);
        break;
      case "subscription.paid":
        await handleSubscriptionPaid(event);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event);
        break;
      case "subscription.expired":
        await handleSubscriptionExpired(event);
        break;
      case "subscription.trialing":
        await handleSubscriptionTrialing(event);
        break;
      default:
        console.log(
          `Unhandled event type: ${event.eventType} ${JSON.stringify(event)}`
        );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Webhook processing failed", details: errorMessage },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(event: CreemWebhookEvent) {
  const checkout = event.object;
  console.log("Processing completed checkout:", checkout);

  try {
    // Validate required data
    if (!checkout.metadata?.user_id) {
      console.error("Missing user_id in checkout metadata:", checkout);
      throw new Error("user_id is required in checkout metadata");
    }

    // Create or update customer
    const customerId = await createOrUpdateCustomer(
      checkout.customer,
      checkout.metadata.user_id
    );

    // Check if this is a credit purchase
    if (checkout.metadata?.product_type === "credits") {
      await addCreditsToCustomer(
        customerId,
        checkout.metadata?.credits,
        checkout.order.id,
        `Purchased ${checkout.metadata?.credits} credits`
      );
    }
    // If subscription exists, create or update it
    else if (checkout.subscription) {
      await createOrUpdateSubscription(checkout.subscription, customerId);
    }
  } catch (error) {
    console.error("Error handling checkout completed:", error);
    throw error;
  }
}

async function handleSubscriptionActive(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing active subscription:", subscription);

  try {
    // Create or update customer
    const normalizedCustomer: CreemCustomer =
      typeof subscription.customer === "string"
        ? ({ id: subscription.customer } as any)
        : (subscription.customer as any);
    const customerId = await createOrUpdateCustomer(
      normalizedCustomer,
      subscription.metadata?.user_id
    );

    // Create or update subscription
    await createOrUpdateSubscription(subscription, customerId);
  } catch (error) {
    console.error("Error handling subscription active:", error);
    throw error;
  }
}

async function handleSubscriptionPaid(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing paid subscription:", subscription);

  try {
    // Update subscription status and period
    const normalizedCustomer: CreemCustomer =
      typeof subscription.customer === "string"
        ? ({ id: subscription.customer } as any)
        : (subscription.customer as any);
    const customerId = await createOrUpdateCustomer(
      normalizedCustomer,
      subscription.metadata?.user_id
    );
    const subscriptionId = await createOrUpdateSubscription(subscription, customerId);

    // Award monthly credits for specific subscription products
    const monthlyProductId = process.env.CREEM_SUBSCRIPTION_PRODUCT_ID_MONTHLY;
    const configuredMonthlyCredits = parseInt(
      process.env.CREEM_SUBSCRIPTION_MONTHLY_CREDITS || "",
      10
    );

    // Resolve product id from subscription payload
    const productId =
      typeof subscription?.product === "string"
        ? subscription?.product
        : subscription?.product?.id;

    if (!monthlyProductId) {
      console.warn(
        "CREEM_SUBSCRIPTION_PRODUCT_ID_MONTHLY not set. Skipping monthly credit award."
      );
      return;
    }

    if (productId !== monthlyProductId) {
      console.log(
        `Subscription product ${productId} does not match monthly product ${monthlyProductId}. Skipping credit award.`
      );
      return;
    }

    let monthlyCredits = Number.isFinite(configuredMonthlyCredits)
      ? configuredMonthlyCredits
      : undefined;

    // Try to read credits from product metadata if not configured
    if (
      !monthlyCredits &&
      typeof subscription?.product !== "string" &&
      subscription?.product?.metadata?.credits
    ) {
      monthlyCredits = Number(subscription.product.metadata.credits);
    }

    if (!monthlyCredits || monthlyCredits <= 0) {
      console.warn(
        "Monthly credits not configured (CREEM_SUBSCRIPTION_MONTHLY_CREDITS) and no product metadata. Skipping credit award."
      );
      return;
    }

    // Idempotency: ensure we don't double-credit for the same event
    const serviceClient = createServiceRoleClient();
    const { data: existingHistory } = await serviceClient
      .from("credits_history")
      .select("id")
      .eq("creem_order_id", event.id)
      .maybeSingle();

    if (existingHistory) {
      console.log(
        `Credits already awarded for event ${event.id}. Skipping duplicate.`
      );
      return;
    }

    await addCreditsToCustomer(
      customerId,
      monthlyCredits,
      // Use event.id as idempotency key in credits_history.creem_order_id
      event.id,
      `Monthly subscription credits (sub:${subscriptionId})`
    );
  } catch (error) {
    console.error("Error handling subscription paid:", error);
    throw error;
  }
}

async function handleSubscriptionCanceled(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing canceled subscription:", subscription);

  try {
    // Update subscription status
    const normalizedCustomer: CreemCustomer =
      typeof subscription.customer === "string"
        ? ({ id: subscription.customer } as any)
        : (subscription.customer as any);
    const customerId = await createOrUpdateCustomer(
      normalizedCustomer,
      subscription.metadata?.user_id
    );
    await createOrUpdateSubscription(subscription, customerId);
  } catch (error) {
    console.error("Error handling subscription canceled:", error);
    throw error;
  }
}

async function handleSubscriptionExpired(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing expired subscription:", subscription);

  try {
    // Update subscription status
    const normalizedCustomer: CreemCustomer =
      typeof subscription.customer === "string"
        ? ({ id: subscription.customer } as any)
        : (subscription.customer as any);
    const customerId = await createOrUpdateCustomer(
      normalizedCustomer,
      subscription.metadata?.user_id
    );
    await createOrUpdateSubscription(subscription, customerId);
  } catch (error) {
    console.error("Error handling subscription expired:", error);
    throw error;
  }
}

async function handleSubscriptionTrialing(event: CreemWebhookEvent) {
  const subscription = event.object;
  console.log("Processing trialing subscription:", subscription);

  try {
    // Update subscription status
    const normalizedCustomer: CreemCustomer =
      typeof subscription.customer === "string"
        ? ({ id: subscription.customer } as any)
        : (subscription.customer as any);
    const customerId = await createOrUpdateCustomer(
      normalizedCustomer,
      subscription.metadata?.user_id
    );
    await createOrUpdateSubscription(subscription, customerId);
  } catch (error) {
    console.error("Error handling subscription trialing:", error);
    throw error;
  }
}

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Ensure this route is always dynamic (depends on auth cookies)
export const dynamic = "force-dynamic";

function extractPortalUrl(data: any): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  // Try several possible response shapes
  return (
    data.customer_portal_link ||
    data.customer_portal_url ||
    data.portal_url ||
    data.url ||
    undefined
  );
}

export async function GET(request: Request) {
  try {
    // Validate required env
    const apiUrl = process.env.CREEM_API_URL;
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        {
          error: "CREEM API not configured",
          missing: {
            CREEM_API_URL: !apiUrl,
            CREEM_API_KEY: !apiKey,
          },
        },
        { status: 500 }
      );
    }

    // Get the user from the session
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Query as the signed-in user (RLS allows reading own records)
    // Get the customer record for this user, along with a subscription
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select(
        `
        creem_customer_id,
        subscriptions (status, current_period_end)
      `
      )
      .eq("user_id", user.id)
      .single();

    if (customerError || !customer) {
      return new NextResponse("No subscription found", { status: 404 });
    }

    // Prevent calling Creem when customer_id is just a local placeholder
    if (
      !customer.creem_customer_id ||
      customer.creem_customer_id.startsWith("auto_") ||
      customer.creem_customer_id.startsWith("existing_")
    ) {
      return NextResponse.json(
        {
          error:
            "No valid billing profile. This account has no Creem customer yet.",
        },
        { status: 404 }
      );
    }

    // If there is no subscription on file, the portal may not exist
    const hasSub = Array.isArray(customer.subscriptions)
      ? customer.subscriptions.length > 0
      : false;
    if (!hasSub) {
      return NextResponse.json(
        { error: "No subscription found for this account" },
        { status: 404 }
      );
    }

    // Try multiple possible endpoints in case of API changes
    const endpoints = [
      `${apiUrl}/customers/billing`,
      `${apiUrl}/customers/customer-portal`,
      `${apiUrl}/customer-portal`,
    ];

    let lastError: any = null;
    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customer_id: customer.creem_customer_id }),
        });

        const text = await response.text();
        let json: any = undefined;
        try {
          json = text ? JSON.parse(text) : {};
        } catch {}

        if (!response.ok) {
          lastError = {
            status: response.status,
            endpoint: url,
            body: text?.slice(0, 500),
          };
          // Try next endpoint
          continue;
        }

        const portalUrl = extractPortalUrl(json);
        if (!portalUrl) {
          lastError = {
            status: response.status,
            endpoint: url,
            reason: "Missing portal URL in response",
            body: text?.slice(0, 500),
          };
          continue;
        }

        // Success: return a consistent payload shape
        return NextResponse.json({ customer_portal_link: portalUrl });
      } catch (err) {
        lastError = { endpoint: url, error: (err as Error)?.message };
        continue;
      }
    }

    // If we reached here, all endpoint attempts failed
    console.error("Failed to get customer portal link", lastError);
    return NextResponse.json(
      { error: "Failed to get customer portal link", details: lastError },
      { status: 502 }
    );
  } catch (error) {
    console.error("Error getting customer portal link:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

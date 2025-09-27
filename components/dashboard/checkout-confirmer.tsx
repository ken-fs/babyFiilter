"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutConfirmer() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // avoid double-run on React strict mode
    ran.current = true;

    const url = new URL(window.location.href);
    const checkoutId = url.searchParams.get("checkout_id") || url.searchParams.get("id");
    const subscriptionId = url.searchParams.get("subscription_id");
    const orderId = url.searchParams.get("order_id");
    if (!checkoutId && !subscriptionId && !orderId) return;

    (async () => {
      try {
        const params = new URLSearchParams();
        if (checkoutId) params.set("checkout_id", checkoutId);
        if (subscriptionId) params.set("subscription_id", subscriptionId);
        if (orderId) params.set("order_id", orderId);
        const res = await fetch(`/api/creem/confirm?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        // Whether success or not, clean the URL; user can refresh manually
      } catch {}
      finally {
        // Remove query params from URL without full reload
        url.searchParams.delete("checkout_id");
        url.searchParams.delete("id");
        url.searchParams.delete("order_id");
        url.searchParams.delete("subscription_id");
        url.searchParams.delete("customer_id");
        url.searchParams.delete("product_id");
        url.searchParams.delete("signature");
        window.history.replaceState({}, "", url.pathname + (url.search ? `?${url.searchParams.toString()}` : "") + url.hash);
        router.refresh();
      }
    })();
  }, [router]);

  return null;
}

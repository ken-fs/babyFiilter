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
    if (!checkoutId) return;

    (async () => {
      try {
        const res = await fetch(`/api/creem/confirm?checkout_id=${encodeURIComponent(checkoutId)}`, {
          method: "GET",
          cache: "no-store",
        });
        // Whether success or not, clean the URL; user can refresh manually
      } catch {}
      finally {
        // Remove query params from URL without full reload
        url.searchParams.delete("checkout_id");
        url.searchParams.delete("id");
        window.history.replaceState({}, "", url.pathname + (url.search ? `?${url.searchParams.toString()}` : "") + url.hash);
        router.refresh();
      }
    })();
  }, [router]);

  return null;
}


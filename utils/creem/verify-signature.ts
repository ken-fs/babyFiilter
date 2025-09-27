import { createHmac } from "crypto";

export function verifyCreemWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Some providers prefix the signature header (e.g. "t=...,v1=abcdef").
    // Try to normalize by extracting the hex digest part when present.
    const normalizedSig = extractDigest(signature);

    // Create HMAC SHA256 hash
    const hmac = createHmac("sha256", secret);
    const calculatedSignature = hmac.update(payload).digest("hex");

    // Compare signatures using timing-safe comparison
    return timingSafeEqual(normalizedSig, calculatedSignature);
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Extracts the digest (hex) part from possible composite headers (e.g. "t=...,v1=abcdef")
function extractDigest(headerValue: string): string {
  if (!headerValue) return headerValue;
  // Common forms: "v1=abcd", "t=123,v1=abcd", "signature=abcd"
  const parts = headerValue.split(/[;,]/).map((p) => p.trim());
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (!v) continue;
    const key = k?.toLowerCase();
    if (key === "v1" || key === "signature") return v;
  }
  // Fallback: if it contains '=', take the last segment
  if (headerValue.includes("=")) {
    const seg = headerValue.split("=").pop();
    return seg || headerValue;
  }
  return headerValue;
}

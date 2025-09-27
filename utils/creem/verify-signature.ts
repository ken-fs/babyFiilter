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

    // Create HMAC SHA256 hash (binary), then expose as hex & base64 to match either format
    const raw = createHmac("sha256", secret).update(payload).digest();
    const calcHex = raw.toString("hex");
    const calcB64 = raw.toString("base64");

    // Compare against both hex and base64 forms
    if (normalizedSig.length === calcHex.length && timingSafeEqual(normalizedSig, calcHex)) return true;
    if (normalizedSig.length === calcB64.length && timingSafeEqual(normalizedSig, calcB64)) return true;

    // Some providers prefix algorithm like "sha256=..."
    const alt = stripAlgoPrefix(normalizedSig);
    if (alt && alt.length === calcHex.length && timingSafeEqual(alt, calcHex)) return true;
    if (alt && alt.length === calcB64.length && timingSafeEqual(alt, calcB64)) return true;

    return false;
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
    if (key === "v1" || key === "signature" || key === "sha256") return v;
  }
  // Fallback: if it contains '=', take the last segment
  if (headerValue.includes("=")) {
    const seg = headerValue.split("=").pop();
    return seg || headerValue;
  }
  return headerValue;
}

function stripAlgoPrefix(v: string): string | null {
  if (!v) return null;
  const idx = v.indexOf("=");
  if (idx > 0 && /sha\d{3}/i.test(v.slice(0, idx))) return v.slice(idx + 1);
  return v;
}

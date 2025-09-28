export function formatDateYYYYMMDD(input: string | Date): string {
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (isNaN(d.getTime())) return "";
    // Use UTC to keep SSR/CSR consistent
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function formatDateTimeYYYYMMDDHHMM(input: string | Date): string {
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (isNaN(d.getTime())) return "";
    // Use UTC to keep SSR/CSR consistent
    const iso = d.toISOString();
    return iso.slice(0, 16).replace("T", " "); // YYYY-MM-DD HH:mm
  } catch {
    return "";
  }
}

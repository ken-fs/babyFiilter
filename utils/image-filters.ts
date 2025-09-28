export type FilterStyle = "youth" | "cartoon" | "baby";
export type Intensity = "light" | "medium" | "strong";

function getFilters(style: FilterStyle, intensity: Intensity) {
  const base = {
    brightness: 1,
    contrast: 1,
    saturate: 1,
    blurPx: 0,
  };

  const byIntensity = {
    light: { brightness: 1.05, contrast: 0.98, saturate: 1.1, blurPx: 0.4 },
    medium: { brightness: 1.1, contrast: 0.95, saturate: 1.25, blurPx: 1.0 },
    strong: { brightness: 1.18, contrast: 0.9, saturate: 1.4, blurPx: 1.8 },
  } as const;

  const i = byIntensity[intensity];

  // Style-specific tweaks layered on top of intensity
  switch (style) {
    case "baby":
      return {
        brightness: i.brightness * 1.06,
        contrast: i.contrast * 0.98,
        saturate: i.saturate * 1.15,
        blurPx: i.blurPx + 0.6,
      };
    case "cartoon":
      return {
        brightness: i.brightness * 1.02,
        contrast: i.contrast * 1.05,
        saturate: i.saturate * 1.35,
        blurPx: Math.max(0, i.blurPx - 0.2),
      };
    case "youth":
    default:
      return {
        brightness: i.brightness * 1.05,
        contrast: i.contrast * 1.0,
        saturate: i.saturate * 1.2,
        blurPx: Math.max(0, i.blurPx - 0.1),
      };
  }
}

function clampMaxSize(width: number, height: number, max = 1280) {
  if (width <= max && height <= max) return { width, height };
  const scale = Math.min(max / width, max / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function fileToObjectUrl(file: File): Promise<string> {
  return URL.createObjectURL(file);
}

export async function applyCuteFilter(
  src: File | string,
  style: FilterStyle,
  intensity: Intensity
): Promise<string> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = await loadImage(url);
    const { width, height } = clampMaxSize(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");

    const f = getFilters(style, intensity);
    // CSS-like canvas filter string
    ctx.filter = `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate}) blur(${f.blurPx}px)`;
    ctx.drawImage(img, 0, 0, width, height);

    // Optional: gentle softlight overlay to smooth tones slightly
    ctx.globalCompositeOperation = "soft-light" as GlobalCompositeOperation;
    ctx.fillStyle = "rgba(255, 224, 240, 0.04)"; // subtle pinkish glow
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";

    return canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    if (typeof src !== "string") URL.revokeObjectURL(url);
  }
}

export async function addWatermark(dataUrl: string, text = "BABY FILTER"): Promise<string> {
  const img = await loadImage(dataUrl);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context not available");

  ctx.drawImage(img, 0, 0, width, height);

  const fontSize = Math.round(Math.max(16, width * 0.035));
  ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
  ctx.textBaseline = "bottom";
  const padding = Math.round(Math.max(12, width * 0.02));
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize; // approximation

  // Semi-transparent rounded box behind text for readability
  const boxWidth = textWidth + padding * 2;
  const boxHeight = textHeight + padding * 1.2;
  const x = width - boxWidth - padding;
  const y = height - boxHeight - padding;

  roundRect(ctx, x, y, boxWidth, boxHeight, Math.max(8, fontSize * 0.3));
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fill();

  // Text with subtle shadow
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = Math.max(2, fontSize * 0.15);
  ctx.fillText(text, x + padding, y + boxHeight - padding * 0.5);

  return canvas.toDataURL("image/jpeg", 0.92);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}


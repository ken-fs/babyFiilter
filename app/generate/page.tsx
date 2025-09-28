"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUser } from "@/hooks/use-user";
import { useCredits } from "@/hooks/use-credits";
import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";
import { addWatermark, applyCuteFilter, fileToObjectUrl, type FilterStyle, type Intensity } from "@/utils/image-filters";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const CREDITS_PER_IMAGE = 5; // 每次图片API消耗 5 积分

type Result = {
  originalUrl: string;
  resultUrl: string;
};

export default function GeneratePage() {
  const { user } = useUser();
  const { credits, loading: creditsLoading, error: creditsError, spendCredits, refetchCredits } = useCredits();
  const { isSubscribed, loading: subLoading } = useSubscription();

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<FilterStyle>("baby");
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [slider, setSlider] = useState(50); // before/after compare slider percent
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const canGenerate = useMemo(() => !!file && !!user && !isGenerating, [file, user, isGenerating]);

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const f = list[0];
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Only JPG/PNG/WebP are supported.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Each file must be <= ${MAX_SIZE_MB}MB.`);
      return;
    }
    setError(null);
    setFile(f);
    const url = await fileToObjectUrl(f);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(url);
    setResult(null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onBrowse = () => inputRef.current?.click();

  const onGenerate = async () => {
    if (!file) return;
    setIsGenerating(true);
    setError(null);
    try {
      // Spend credits if not subscribed
      if (user && !isSubscribed) {
        const ok = await spendCredits(CREDITS_PER_IMAGE, "image_generation");
        if (!ok) {
          setError("Insufficient credits. Please purchase or subscribe.");
          setIsGenerating(false);
          return;
        }
      }

      const processed = await applyCuteFilter(file, style, intensity);
      const originalUrl = fileUrl || (await fileToObjectUrl(file));
      setResult({ originalUrl, resultUrl: processed });
      if (!isSubscribed) await refetchCredits();
    } catch (e) {
      setError("Failed to process image.");
      // Optionally refund if processing fails (omitted here)
    } finally {
      setIsGenerating(false);
    }
  };

  const onDownload = async () => {
    if (!result) return;
    const needsWatermark = !isSubscribed;
    const dataUrl = needsWatermark
      ? await addWatermark(result.resultUrl, "BABY FILTER")
      : result.resultUrl;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `baby-filter-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="container max-w-screen-xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Baby Filter · Image to Image</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Upload or capture a face photo. Choose style and intensity. Preview instantly and download
          {" "}
          {isSubscribed ? "without watermark." : "with watermark (subscribe to remove)."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload & Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="rounded-lg border border-dashed border-border p-6 text-center"
            >
              {!fileUrl ? (
                <>
                  <div className="text-lg font-medium">Drop an image or browse</div>
                  <div className="mt-2 text-sm text-muted-foreground">JPG/PNG/WebP · up to {MAX_SIZE_MB}MB</div>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={onBrowse}>Browse</Button>
                    <input
                      ref={inputRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(",")}
                      // Mobile capture hint
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </div>
                  {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {result ? (
                    <CompareView beforeUrl={result.originalUrl} afterUrl={result.resultUrl} value={slider} onChange={setSlider} />
                  ) : (
                    <img src={fileUrl} alt="original" className="mx-auto max-h-[60vh] rounded-md object-contain" />
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={() => { setFile(null); setFileUrl(null); setResult(null); }}>Replace</Button>
                    <Button variant="outline" size="sm" onClick={() => { setResult(null); }}>Reset Preview</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filter Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Style</Label>
              <RadioGroup value={style} onValueChange={(v) => setStyle(v as FilterStyle)} className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="baby" id="style-baby" />
                  <Label htmlFor="style-baby">Baby Smooth</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="youth" id="style-youth" />
                  <Label htmlFor="style-youth">Youth Look</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cartoon" id="style-cartoon" />
                  <Label htmlFor="style-cartoon">Cartoon Cute</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Intensity</Label>
              <RadioGroup value={intensity} onValueChange={(v) => setIntensity(v as Intensity)} className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="int-light" />
                  <Label htmlFor="int-light">Light</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="medium" id="int-medium" />
                  <Label htmlFor="int-medium">Medium</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="strong" id="int-strong" />
                  <Label htmlFor="int-strong">High</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Actions</Label>
              <div className="flex gap-2">
                {user ? (
                  <Button className="flex-1" onClick={onGenerate} disabled={!canGenerate}>
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                ) : (
                  <Button asChild className="flex-1">
                    <Link href="/sign-in">Sign in to Generate</Link>
                  </Button>
                )}
                <Button variant="outline" disabled={!result} onClick={onDownload}>
                  Download{!isSubscribed ? " (Watermark)" : ""}
                </Button>
              </div>
            </div>

            {!user && (
              <div className="text-xs text-muted-foreground">
                使用前必须先登录。免费用户每天 3 次试用；订阅用户不限量。
              </div>
            )}

            {user && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  每次图片处理消耗 {CREDITS_PER_IMAGE} 积分。
                  {isSubscribed ? "（当前为订阅用户，不扣积分）" : ""}
                </div>
                {!isSubscribed && (
                  <div>
                    {creditsLoading ? "加载积分中..." : creditsError ? "积分读取失败" : `剩余积分：${credits?.remaining_credits ?? 0}`}
                    {" "}
                    <Link href="/pricing" className="underline">购买/订阅</Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CompareView({
  beforeUrl,
  afterUrl,
  value,
  onChange,
}: {
  beforeUrl: string;
  afterUrl: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setWidth(el.clientWidth));
    obs.observe(el);
    setWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  const clip = Math.round((width * value) / 100);

  return (
    <div className="w-full">
      <div ref={containerRef} className="relative w-full rounded-md overflow-hidden bg-muted">
        <img src={beforeUrl} alt="before" className="w-full h-auto object-contain block" />
        <img
          src={afterUrl}
          alt="after"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: `inset(0 ${Math.max(0, width - clip)}px 0 0)` }}
        />
        <div className="pointer-events-none absolute inset-y-0" style={{ left: clip - 1, width: 2 }}>
          <div className="h-full bg-white/70" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-muted-foreground w-12 text-right">{value}%</span>
      </div>
    </div>
  );
}


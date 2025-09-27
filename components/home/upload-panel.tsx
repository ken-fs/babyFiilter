"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILES = 9;
const MAX_SIZE_MB = 10;

export default function UploadPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const next: File[] = [];
    for (const f of Array.from(list)) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setError("Only JPG/PNG/WebP are supported.");
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each file must be ≤ ${MAX_SIZE_MB}MB.`);
        continue;
      }
      next.push(f);
    }
    const merged = [...files, ...next].slice(0, MAX_FILES);
    setFiles(merged);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const onBrowse = () => inputRef.current?.click();
  const removeAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const clearAll = () => setFiles([]);

  const onGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    // Demo only: fake progress for UI. Backend wiring intentionally omitted.
    await new Promise((r) => setTimeout(r, 1200));
    setIsGenerating(false);
  };

  return (
    <div id="hero-upload" className="w-full">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="group relative rounded-2xl border border-border bg-gradient-to-b from-background/40 to-background/70 p-6 md:p-8 shadow-xl"
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-2">Upload up to 9 photos · Generate · Download</div>
            <div className="rounded-lg border border-dashed border-border p-6 md:p-8 text-center">
              <div className="text-lg font-medium">Drop images here</div>
              <div className="mt-2 text-sm text-muted-foreground">JPG/PNG/WebP · ≤10MB each</div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={onBrowse}>Browse</Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  multiple
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
              </div>
            </div>
            {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
          </div>

          <div className="w-full md:w-80 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Mechanization Strength</label>
                <select className="h-10 rounded-md border border-border bg-background px-3">
                  <option>Subtle</option>
                  <option>Medium</option>
                  <option>Full</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Material Preset</label>
                <select className="h-10 rounded-md border border-border bg-background px-3">
                  <option>Brushed Aluminum</option>
                  <option>Titanium</option>
                  <option>Ceramic Composite</option>
                  <option>Matte Polymer</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Panel Density</label>
                <select className="h-10 rounded-md border border-border bg-background px-3">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Background</label>
                <select className="h-10 rounded-md border border-border bg-background px-3">
                  <option>Keep original</option>
                  <option>Neutral studio</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="flex-1" onClick={onGenerate} disabled={files.length === 0 || isGenerating}>
                {isGenerating ? "Generating…" : "Generate"}
              </Button>
              <Button variant="outline" onClick={clearAll} disabled={files.length === 0}>
                Clear
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              AI‑generated with invisible SynthID watermark (provenance by design)
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <div className="text-sm mb-2">Selected ({files.length}/{MAX_FILES})</div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <div className="aspect-square rounded-md border border-border bg-muted/10 flex items-center justify-center text-xs text-muted-foreground p-2 overflow-hidden">
                    {f.name}
                  </div>
                  <button
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border border-border text-xs hover:bg-muted"
                    onClick={() => removeAt(i)}
                    aria-label={`Remove ${f.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <Button asChild variant="ghost" className="px-0 h-auto text-primary">
          <a href="#gallery">View Samples</a>
        </Button>
        <Button asChild variant="ghost" className="px-0 h-auto text-primary">
          <a href="/docs">Read Docs</a>
        </Button>
        <Button asChild variant="ghost" className="px-0 h-auto text-primary">
          <a href="#provenance">Copy Attribution</a>
        </Button>
      </div>
    </div>
  );
}

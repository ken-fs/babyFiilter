export const metadata = {
  title: "Docs — BabyFilter",
  description:
    "How BabyFilter works: controls, steps, safety and provenance with SynthID watermarking, and usage notes.",
};

export default function DocsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do you store my photos?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "By default, we don’t retain uploads after processing; you can opt in for galleries or choose immediate deletion.",
        },
      },
      {
        "@type": "Question",
        name: "Is the watermark visible?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "We embed an invisible SynthID watermark; verify via supported tools. We may also add visible captions.",
        },
      },
      {
        "@type": "Question",
        name: "What content is blocked?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Weapons, gore, nudity, and any content about real minors. We also suppress common artifacts.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Documentation</h1>
            <p className="mt-4 text-muted-foreground">
              Learn how to use BabyFilter effectively. Configure parameters, understand processing steps, and review safety & provenance.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-semibold">Controls</h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2 text-muted-foreground">
            <li>Mechanization Strength: Subtle / Medium / Full</li>
            <li>Material Presets: Brushed Aluminum / Titanium / Ceramic Composite / Matte Polymer</li>
            <li>Panel Density: Low / Medium / High</li>
            <li>Background: Keep original / Neutral studio</li>
          </ul>

          <h2 className="mt-10 text-2xl font-semibold">How It Works</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Upload 1–9 images (≤10MB each). JPG/PNG/WebP supported.</li>
            <li>Describe (optional): materials, mech intensity, panel line density, background handling.</li>
            <li>Configure: choose strength, material, density, and background.</li>
            <li>Generate: progress and ETA update in real time.</li>
            <li>Review & Export: download JPG/PNG/WebP and copy attribution.</li>
          </ol>

          <h2 id="safety" className="mt-10 text-2xl font-semibold">Safety & Provenance</h2>
          <p className="mt-4 text-muted-foreground">
            Visual entertainment effect only; not a depiction of real minors. Moderation filters inappropriate inputs. Results embed invisible SynthID watermark to support provenance.
          </p>

          <h2 className="mt-10 text-2xl font-semibold">FAQ</h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold">Do you store my photos?</h3>
              <p>By default, we don’t retain uploads after processing; you can opt in for galleries or choose immediate deletion.</p>
            </div>
            <div>
              <h3 className="font-semibold">Is the watermark visible?</h3>
              <p>We embed an invisible SynthID watermark; verify via supported tools. We may also add visible captions.</p>
            </div>
            <div>
              <h3 className="font-semibold">What content is blocked?</h3>
              <p>Weapons, gore, nudity, and any content about real minors. We also suppress common artifacts.</p>
            </div>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        </div>
      </section>
    </div>
  );
}


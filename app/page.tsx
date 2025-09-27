import UploadPanel from "@/components/home/upload-panel";

export default function Home() {
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
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-background to-background/60">
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-xs md:text-sm bg-primary/10 text-primary mb-4">
              AI‑Powered, SynthID Watermarked
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              BabyFilter — Youth Filter + Mech Stylizer (AI‑Powered, SynthID Watermarked)
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              Transform faces, pets, and objects into identity‑faithful mech‑stylized portraits with youth‑like proportions. BabyFilter is a creator‑grade filter that locks style server‑side, preserves structure, and renders realistic hard‑surface panels, bolts, joints, LEDs, and reflections. Not a toy “beauty app” — it’s a robust visual effect pipeline for content teams and enthusiasts.
            </p>
          </div>

          <div className="mt-10">
            <UploadPanel />
          </div>

          <p className="mt-8 max-w-4xl text-sm md:text-base text-muted-foreground">
            Apply our youth stylization to selfies and product shots: bold identity preservation, realistic mech‑panel finish, and safe defaults. Ideal if you want to apply baby filter to photo online, upload photo get baby filter result, or explore AI age regression filter online responsibly.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16" id="at-a-glance">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">At‑a‑Glance</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2 text-muted-foreground">
            <li>Works with 1–9 images (JPG/PNG/WebP, ≤10MB each)</li>
            <li>Default engine: Google Gemini 2.5 Flash Image (“Nano Banana”)</li>
            <li>Outputs: AI‑generated with invisible SynthID watermark</li>
            <li>Safety: Visual entertainment effect only; not about real minors</li>
            <li>Privacy: Moderation on by default; opt‑out storage and self‑delete</li>
          </ul>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/10" id="features">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Features & Benefits</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">Identity Fidelity, Structure First</h3>
              <p className="mt-2 text-muted-foreground">Locks pose/proportions; preserves unique facial lines, pet markings, or object geometry.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Photoreal Mech Finish</h3>
              <p className="mt-2 text-muted-foreground">Hard‑surface panels, visible seams, fasteners, pistons, tidy cabling, point LEDs; realistic reflections and micro‑scratches.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Server‑Enforced Style</h3>
              <p className="mt-2 text-muted-foreground">Style‑Lock Suffix injected server‑side (non‑overridable) to keep output on‑model and compliant.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold" id="safety">Safety + Privacy by Default</h3>
              <p className="mt-2 text-muted-foreground">No weapons/gore/nudity; moderation + face detection filter inappropriate inputs. Opt‑out storage or self‑delete.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Fast, Creator‑Grade Pipeline</h3>
              <p className="mt-2 text-muted-foreground">Runs on Google Gemini 2.5 Flash Image. Useful for production teams, cosplayers, indie merch sellers, and marketers.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Watermarked Provenance</h3>
              <p className="mt-2 text-muted-foreground">Every result includes an invisible SynthID; export attribution in one click.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16" id="controls">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Controls</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2 text-muted-foreground">
            <li>Mechanization Strength: Subtle / Medium / Full</li>
            <li>Material Presets: Brushed Aluminum / Titanium / Ceramic Composite / Matte Polymer</li>
            <li>Panel Density: Low / Medium / High</li>
            <li>Background: Keep original / Neutral studio</li>
          </ul>

          <h3 className="mt-10 text-xl font-semibold">SEO‑Friendly Benefits</h3>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>Try a baby filter free online editor that keeps your brand safe.</li>
            <li>Compare baby filter vs youth filter differences to pick the right look.</li>
            <li>A playful, ethical AI baby generator experience with provenance.</li>
          </ul>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/10" id="how-it-works">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">How It Works</h2>
          <h3 className="mt-6 text-xl font-semibold">Steps</h3>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>Upload: 1–9 images (≤10MB each). JPG/PNG/WebP supported.</li>
            <li>Describe (optional): materials, mech intensity, panel line density, background handling.</li>
            <li>Configure: choose strength, material, density, and background.</li>
            <li>Generate: Progress bar and ETA update in real time.</li>
            <li>Review & Export: Download JPG/PNG/WebP; “Copy attribution” adds “AI‑generated with invisible SynthID watermark”.</li>
            <li>Share: Safe to share on social; clear watermarking helps avoid misleading use.</li>
          </ul>

          <h3 className="mt-8 text-xl font-semibold">Notes</h3>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>Visual entertainment effect only; not a depiction of real minors.</li>
            <li>Use light, clean backgrounds for the crispest panel edges.</li>
          </ul>
        </div>
      </section>

      <section className="py-12 md:py-16" id="use-cases">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Use Cases</h2>
          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold">Social Creatives and Campaigns</h3>
              <p className="mt-2 text-muted-foreground">Launch playful filters for product drops or seasonal promos. Seamlessly apply baby filter to photo online and export for ads or Stories.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Cosplay and Gaming</h3>
              <p className="mt-2 text-muted-foreground">Convert character selfies into mech‑stylized youth looks; material presets match sci‑fi themes.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Pet Owners</h3>
              <p className="mt-2 text-muted-foreground">Make mech‑cute versions of pets with preserved markings.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Designers & Indie Merch Sellers</h3>
              <p className="mt-2 text-muted-foreground">Generate distinctive avatars and sticker sheets. Integrate with mockups or print‑on‑demand.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Tech Enthusiasts & Hobbyists</h3>
              <p className="mt-2 text-muted-foreground">Explore material science aesthetics with panel density sweeps and parameterizable mech joints.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Couples & Family Play</h3>
              <p className="mt-2 text-muted-foreground">“What if we were tiny mechs?” Upload two photos to play with a pseudo‑merge. This mimics “generate baby from parent photos” purely as a playful mashup — not a biological or biometric prediction — and can be framed as a private future baby predictor for fun. It is an ethical AI baby generator approach — watermarked, moderated, and clearly fictional.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/10" id="faq">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">FAQ</h2>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold">Do you store my photos?</h3>
              <p className="text-muted-foreground">By default, we don’t retain uploads after processing; you can opt in for galleries or choose immediate deletion.</p>
            </div>
            <div>
              <h3 className="font-semibold">Is the watermark visible?</h3>
              <p className="text-muted-foreground">We embed an invisible SynthID watermark; verify via supported tools. We may also add visible captions.</p>
            </div>
            <div>
              <h3 className="font-semibold">What content is blocked?</h3>
              <p className="text-muted-foreground">Weapons, gore, nudity, and any content about real minors. We also suppress common artifacts.</p>
            </div>
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </div>
      </section>

      <section className="py-12 md:py-16" id="gallery">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Gallery</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-muted-foreground">
            <li>Cosplay</li>
            <li>Pets</li>
            <li>Products</li>
            <li>Indie merch mockups</li>
          </ul>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/10" id="docs">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Docs</h2>
          <p className="mt-4"><a className="text-primary" href="#">Read Docs</a></p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/10" id="provenance">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Provenance</h2>
          <p className="mt-4 text-muted-foreground">Infographic — SynthID (pixel) vs C2PA (manifest).</p>
        </div>
      </section>

      <section className="py-12 md:py-16" id="user-love">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">User Love</h2>
          <ul className="mt-6 space-y-3 text-muted-foreground">
            <li>“Our cosplay teasers shipped 2× faster with panel presets.”</li>
            <li>“Pet mech portraits became a top‑performing Reel overnight.”</li>
            <li>“Brand avatars look consistent thanks to the server‑locked style.”</li>
          </ul>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/10" id="visual-layout">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Visual & Layout Suggestions</h2>
          <ul className="mt-6 space-y-2 text-muted-foreground">
            <li>Hero: Side‑by‑side before/after (mech panels visible, neutral studio background).</li>
            <li>Feature cards: Identity Preservation, Watermarked Provenance, Safety, Speed, Controls.</li>
            <li>Parameter drawer: Mechanization Strength, Materials, Panel Density, Background.</li>
            <li>Provenance: Infographic — SynthID (pixel) vs C2PA (manifest).</li>
            <li>Gallery: Cosplay, pets, products, indie merch mockups.</li>
          </ul>
        </div>
      </section>

      <section className="py-16" id="summary-cta">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold">Summary & CTA</h2>
            <p className="mt-6 text-muted-foreground">
              Turn any face, pet, or object into a mech‑stylized youth‑look portrait — fast, safe, watermarked, and production‑ready. Try the playful “couple mech‑youth” mashup or the “family baby‑ified” collage in a single flow. Always AI‑labeled, always responsible.
            </p>
            <ul className="mt-6 space-y-2">
              <li><a className="text-primary" href="#hero-upload">Try BabyFilter now</a></li>
              <li><a className="text-primary" href="#docs">View Docs</a></li>
              <li><a className="text-primary" href="#safety">Read Safety & Provenance</a></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/10" id="product-info">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Product Info for Directories/Communities</h2>
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Product Name</h3>
              <p className="text-muted-foreground">BabyFilter — Youth Filter + Mech Stylizer</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">One‑Line Pitch</h3>
              <p className="text-muted-foreground">Mech‑styled youth filter with invisible SynthID watermark — safe, fast, and online.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Product Overview</h3>
              <p className="text-muted-foreground">BabyFilter converts faces, pets, and objects into identity‑faithful, mech‑styled youth portraits. Upload 1–9 photos, tune mechanization strength, materials, and panel density, then export watermarked images. Built for content creators, designers, marketers, social teams, cosplayers/gamers, indie merch sellers, and tech enthusiasts.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

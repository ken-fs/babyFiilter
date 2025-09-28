import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const baseUrl = process.env.BASE_URL
  ? `https://${process.env.BASE_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title:
    "BabyFilter — Youth Filter + Mech Stylizer (SynthID Watermark, Online)",
  description:
    "Apply a mech‑styled youth filter to photos with identity fidelity, safety guardrails, and invisible SynthID watermarking. Upload 1–9 images, configure materials and panel density, and export watermarked results. Try a playful, compliant take on ‘age regression,’ a baby filter free online editor mode, and compare baby filter vs youth filter differences before you ship.",
  keywords: [
    "apply baby filter to photo online",
    "upload photo get baby filter result",
    "how to look younger with AI filter",
    "childlike cartoon filter free",
    "cute baby face generator from selfie",
    "baby filter vs youth filter differences",
    "AI age regression filter online",
    "ethical AI baby generator",
  ],
  openGraph: {
    title: "BabyFilter — Youth Filter + Mech Stylizer",
    description: "AI mech‑stylized youth filter with SynthID watermark",
    type: "website",
    url: baseUrl,
    images: [
      {
        url: "https://babyfilter.ai/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "BabyFilter — Youth Filter + Mech Stylizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BabyFilter — Youth Filter + Mech Stylizer",
    description: "Safe, watermarked youth stylization powered by Gemini 2.5",
    images: ["https://babyfilter.ai/og-cover.jpg"],
  },
  alternates: {
    canonical: "https://babyfilter.ai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: any = null;
  try {
    if (process.env.SKIP_AUTH_FETCH !== "1") {
      const supabase = await createClient();
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      user = u ?? null;
    }
  } catch (_) {
    // Network may be blocked or env not set; render as logged-out.
    user = null;
  }

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <Header user={user} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

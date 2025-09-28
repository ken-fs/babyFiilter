"use client";

import { useEffect, useState } from "react";

export type Lang = "en" | "zh";

export function useLanguage(): Lang {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    // Initialize from localStorage or browser language
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    const initial: Lang = stored || (navigator?.language?.toLowerCase().startsWith("zh") ? "zh" : "en");
    setLang(initial);
    try {
      document.documentElement.lang = initial;
    } catch {}

    // Listen for changes dispatched by the LanguageSwitcher
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Lang | undefined;
      if (detail === "en" || detail === "zh") {
        setLang(detail);
        try {
          document.documentElement.lang = detail;
        } catch {}
      }
    };

    window.addEventListener("language-change", onChange as EventListener);
    return () => window.removeEventListener("language-change", onChange as EventListener);
  }, []);

  return lang;
}


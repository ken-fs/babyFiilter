"use client";

import { useLanguage, type Lang } from "@/hooks/use-language";
import en from "@/i18n/en.json";
import zh from "@/i18n/zh.json";

type Messages = typeof en;

export function useI18n(): Messages {
  const lang: Lang = useLanguage();
  const dict: Record<Lang, Messages> = { en, zh } as const;
  // Fallback to English if unknown
  return dict[lang] || en;
}


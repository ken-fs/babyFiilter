"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

type Lang = "en" | "zh";

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    const initial: Lang = stored || (navigator?.language?.toLowerCase().startsWith("zh") ? "zh" : "en");
    setLang(initial);
  }, []);

  if (!mounted) return null;

  const ICON_SIZE = 16;

  const onChange = (value: string) => {
    const next = (value === "zh" ? "zh" : "en") as Lang;
    setLang(next);
    try {
      localStorage.setItem("lang", next);
      document.documentElement.lang = next;
      const evt = new CustomEvent("language-change", { detail: next });
      window.dispatchEvent(evt);
    } catch {}
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={"sm"}
          className="focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Globe size={ICON_SIZE} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="end">
        <DropdownMenuRadioGroup value={lang} onValueChange={onChange}>
          <DropdownMenuRadioItem className="flex gap-2" value="en">
            <span>English</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="zh">
            <span>中文</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


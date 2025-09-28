import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 hover:opacity-90 transition-opacity"
      aria-label="BabyFilter Home"
    >
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/80 to-purple-500/70 text-primary-foreground shadow-[0_0_24px_-6px_rgba(168,85,247,0.8)]"
      >
        🤖
      </span>
      <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-primary to-fuchsia-400 bg-clip-text text-transparent tracking-wide">
        BabyFilter
      </span>
    </Link>
  );
}

"use client";

import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { useI18n } from "@/hooks/use-i18n";

interface HeaderProps {
  user: any;
}

interface NavItem {
  label: string;
  href: string;
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const t = useI18n();

  // Main navigation modeled after Nano Banana-style layout
  const mainNavItems: NavItem[] = [
    { label: t.nav.generate, href: "/generate" },
    { label: t.nav.features, href: "/#features" },
    { label: t.nav.samples, href: "/#gallery" },
    { label: t.nav.pricing, href: "/pricing" },
    { label: t.nav.faq, href: "/#faq" },
    { label: t.nav.docs, href: "/docs" },
  ];

  // Dashboard items - empty array as we don't want navigation items in dashboard
  const dashboardItems: NavItem[] = [];

  // Choose which navigation items to show
  const navItems = isDashboard ? dashboardItems : mainNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl 2xl:max-w-[1680px] flex h-16 items-center px-4 gap-3">
        <div className="flex items-center min-w-0">
          <Logo />
        </div>

        {/* Centered Navigation - show on lg+ only, avoid overlap */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-6 mx-2 whitespace-nowrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {isDashboard && (
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user.email}
                </span>
              )}
              {!isDashboard && (
                <>
                  <Button asChild size="sm" variant="default">
                    <Link href="/profile">{t.actions.profile}</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard">{t.actions.dashboard}</Link>
                  </Button>
                </>
              )}
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  {t.actions.signOut}
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button asChild size="sm" variant="outline" className="hidden xl:inline-flex">
                <Link href="/sign-in">{t.actions.signIn}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">{t.actions.signUp}</Link>
              </Button>
            </div>
          )}
          <MobileNav items={navItems} user={user} isDashboard={isDashboard} />
        </div>
      </div>
    </header>
  );
}

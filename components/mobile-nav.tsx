"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { useLanguage } from "@/hooks/use-language";

interface MobileNavProps {
  items: { label: string; href: string }[];
  user: any;
  isDashboard: boolean;
}

export function MobileNav({ items, user, isDashboard }: MobileNavProps) {
  const lang = useLanguage();
  const t = {
    en: {
      navigation: "Navigation",
      profile: "Profile",
      dashboard: "Dashboard",
      signOut: "Sign out",
      signIn: "Sign in",
      signUp: "Sign up",
    },
    zh: {
      navigation: "导航",
      profile: "个人资料",
      dashboard: "控制台",
      signOut: "退出",
      signIn: "登录",
      signUp: "注册",
    },
  } as const;
  const L = t[lang] || t.en;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{L.navigation}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t">
          {user ? (
            <div className="flex flex-col gap-2">
              {user.email && (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
              {!isDashboard && (
                <>
                  <Button asChild variant="default" className="w-full">
                    <Link href="/profile">{L.profile}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard">{L.dashboard}</Link>
                  </Button>
                </>
              )}
              <form action={signOutAction} className="w-full">
                <Button type="submit" variant="outline" className="w-full">
                  {L.signOut}
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/sign-in">{L.signIn}</Link>
              </Button>
              <Button asChild variant="default" className="w-full">
                <Link href="/sign-up">{L.signUp}</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

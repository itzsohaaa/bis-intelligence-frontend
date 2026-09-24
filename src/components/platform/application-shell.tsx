"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { isRouteActive, navigation, platformNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

function PlatformNavigation({ pathname, onNavigate }: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Platform navigation" className="space-y-1 p-3">
      {platformNavigation.map(({ href, label, icon: Icon, status }) => {
        const active = isRouteActive(pathname, href);
        return (
          <Link key={href} href={href} onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
            )}>
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {status === "planned" && <span className="text-[10px] uppercase tracking-wide">Planned</span>}
          </Link>
        );
      })}
      <div className="mt-4 border-t pt-3">
        <Link href={navigation.home.href} onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring">
          <navigation.home.icon aria-hidden="true" className="size-4" />
          {navigation.home.label}
        </Link>
      </div>
    </nav>
  );
}

export function ApplicationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPage = platformNavigation.find((item) => isRouteActive(pathname, item.href));

  return (
    <div className="min-h-dvh bg-background lg:pl-72">
      <a href="#platform-content" className="sr-only z-50 rounded-md bg-background p-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r bg-sidebar lg:flex">
        <Link href={navigation.dashboard.href} className="flex min-h-20 items-center gap-3 border-b px-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          <ShieldCheck aria-hidden="true" className="size-7" />
          <span><span className="block font-semibold tracking-tight">BIS Intelligence</span><span className="text-xs text-muted-foreground">Standards. Evidence. Clarity.</span></span>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PlatformNavigation pathname={pathname} />
        </div>
        <p className="border-t p-6 text-xs leading-relaxed text-muted-foreground">Platform preview. BIS services are not connected yet.</p>
      </aside>
      <header className="sticky top-0 z-20 flex min-h-20 items-center gap-3 border-b bg-background px-4 sm:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" className="size-11 lg:hidden" aria-label="Open navigation" />}>
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(20rem,90vw)]! overflow-y-auto bg-sidebar">
            <SheetHeader className="pr-12">
              <SheetTitle>BIS Intelligence</SheetTitle>
              <SheetDescription>Platform preview · services not connected</SheetDescription>
            </SheetHeader>
            <PlatformNavigation pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">BIS Intelligence Platform</p>
          <p className="truncate text-sm font-medium">{currentPage?.label ?? "Platform"}</p>
        </div>
        <Badge variant="outline">Preview</Badge>
      </header>
      <main id="platform-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-10 outline-none sm:px-8 sm:py-14">
        {children}
      </main>
    </div>
  );
}

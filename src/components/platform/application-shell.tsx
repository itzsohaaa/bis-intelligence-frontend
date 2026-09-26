"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CapabilityStatus } from "./capability-status";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { isRouteActive, navigation, platformNavigation } from "@/config/navigation";

function PlatformNavigation({ pathname, onNavigate }: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Platform navigation" className="space-y-1 p-4">
      <p className="bis-eyebrow px-3 pb-3 pt-2">Workspace</p>
      {platformNavigation.map(({ href, label, icon: Icon, status }) => {
        const active = isRouteActive(pathname, href);
        return (
          <Link key={href} href={href} onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className="bis-nav-link">
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {status === "planned" && <span className="bis-meta">Planned</span>}
          </Link>
        );
      })}
      <div className="mt-4 border-t pt-3">
        <Link href={navigation.home.href} onClick={onNavigate}
          className="bis-nav-link">
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
    <div className="platform-theme min-h-dvh lg:pl-64 xl:pl-68">
      <a href="#platform-content" className="sr-only z-50 rounded-md bg-background p-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-rule bg-white lg:flex xl:w-68">
        <Link href={navigation.dashboard.href} className="flex min-h-20 items-center gap-3 border-b px-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          <ShieldCheck aria-hidden="true" className="size-7 shrink-0 text-brand" />
          <span><span className="block font-semibold tracking-tight">BIS Intelligence</span><span className="bis-meta text-muted-foreground">Standards. Evidence. Clarity.</span></span>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PlatformNavigation pathname={pathname} />
        </div>
        <div className="border-t border-rule p-6"><p className="text-sm font-medium text-brand">Evidence at every step.</p><p className="bis-meta mt-2 text-ink-muted">Ask BIS is integrated. Other intelligence modules await backend availability.</p></div>
      </aside>
      <header className="sticky top-0 z-20 flex min-h-18 items-center gap-3 border-b border-rule bg-canvas px-5 sm:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" className="size-11 lg:hidden" aria-label="Open navigation" />}>
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="platform-theme w-[min(20rem,90vw)]! overflow-y-auto bg-white [&_[data-slot=sheet-close]]:size-11">
            <SheetHeader className="pr-12">
              <SheetTitle>BIS Intelligence</SheetTitle>
              <SheetDescription>Standards. Evidence. Clarity.</SheetDescription>
            </SheetHeader>
            <PlatformNavigation pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <p className="bis-meta text-ink-muted">BIS Intelligence</p>
          <p className="text-sm font-medium leading-5">{currentPage?.label ?? "Platform"}</p>
        </div>
        <div className="hidden sm:block">{currentPage && <CapabilityStatus status={currentPage.status} />}</div>
      </header>
      <main id="platform-content" tabIndex={-1} className="bis-page outline-none">
        <div key={pathname} className="bis-enter min-w-0">{children}</div>
      </main>
    </div>
  );
}

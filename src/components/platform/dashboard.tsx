import Link from "next/link";
import { ArrowRight, FileSearch, ShieldQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { navigation, platformNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { CapabilityStatus } from "./capability-status";
import { PageIntro } from "./page-intro";

export function Dashboard() {
  return <div className="bis-stack">
    <PageIntro eyebrow="BIS Intelligence / Workspace" title="A clearer path through compliance." description="Start with a question. Explore the wider compliance journey with evidence and uncertainty kept in view." status="available" />
    <section data-reveal className="bis-panel bis-panel-pad grid gap-7 shadow-dossier md:grid-cols-[1.3fr_1fr]" aria-labelledby="ask-entry">
      <div><div className="mb-6 flex items-center gap-3"><FileSearch aria-hidden="true" className="size-5 text-brand" /><CapabilityStatus status="integrated" /></div><h2 id="ask-entry" className="bis-section-title">Ask a question. Examine the evidence.</h2><p className="bis-copy mt-3 max-w-lg">Ask BIS brings document-grounded answers, source references, and verification context into one workspace.</p><Link href={navigation.askBis.href} className={cn(buttonVariants(), "mt-6 min-h-11 px-5")}>Open Ask BIS<ArrowRight aria-hidden="true" className="bis-action-icon ml-2" /></Link></div>
      <div className="rounded-md border border-rule bg-brand-soft p-5 sm:p-6"><p className="bis-eyebrow">What to expect</p><ol className="mt-4 space-y-4 text-sm leading-6">{["Frame your question with relevant context.", "Read the answer alongside its sources.", "Review uncertainty before taking action."].map((text, index) => <li key={text} className="flex gap-3"><span className="font-mono text-xs leading-6 text-brand">0{index + 1}</span>{text}</li>)}</ol><p className="bis-copy mt-5 border-t border-brand/15 pt-4">The query service is integrated but may be temporarily unavailable. You can still explore every module.</p></div>
    </section>
    <section data-reveal aria-labelledby="modules-title"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><h2 id="modules-title" className="bis-section-title">Explore the platform</h2><p className="text-sm text-ink-muted">Each module shows its current availability.</p></div>
      <div className="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">{platformNavigation.filter((item) => item.href !== "/dashboard" && item.href !== "/ask-bis").map(({ href, label, icon: Icon, description, status }) => <Link key={href} href={href} className="bis-capability-link group"><div className="flex items-center justify-between gap-3"><Icon aria-hidden="true" className="size-5 text-brand" /><ArrowRight aria-hidden="true" className="bis-action-icon size-4 text-ink-muted" /></div><h3 className="bis-card-title group-hover:text-brand">{label}</h3><p className="bis-copy -mt-2">{description}</p><div className="mt-auto"><CapabilityStatus status={status} /></div></Link>)}</div>
    </section>
    <section data-reveal className="flex gap-4 border-t border-rule pt-7" aria-labelledby="dashboard-trust"><ShieldQuestion aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" /><div><h2 id="dashboard-trust" className="bis-card-title">A source trail, not a shortcut to certainty.</h2><p className="bis-copy mt-2 max-w-3xl">Grounded answers reflect retrieved evidence. They can still require verification when that evidence is incomplete, conflicting, or temporally uncertain.</p></div></section>
  </div>;
}

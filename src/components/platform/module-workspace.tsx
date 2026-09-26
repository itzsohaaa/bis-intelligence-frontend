import Link from "next/link";
import { ArrowRight, FileSearch, Layers, ShieldQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { navigation } from "@/config/navigation";
import { modules, type ModulePage } from "@/config/modules";
import { cn } from "@/lib/utils";
import { PageIntro } from "./page-intro";

/** Intended module structure, without simulated results or running requests. */
export function ModuleWorkspace({ page }: { page: ModulePage }) {
  const item = navigation[page];
  const definition = modules[page];
  const Icon = item.icon;
  return <div className="bis-stack">
    <PageIntro eyebrow={definition.eyebrow} title={item.label} description={item.description} status={item.status} />
    <section data-reveal className="bis-panel overflow-hidden" aria-labelledby="module-purpose">
      <div className="bis-panel-pad grid gap-6 border-b border-rule bg-brand-soft md:grid-cols-[1fr_1.1fr] md:gap-10">
        <div><Icon aria-hidden="true" className="mb-5 size-6 text-brand" /><h2 id="module-purpose" className="bis-section-title max-w-sm">{definition.purpose}</h2></div>
        <div className="self-end"><p className="bis-eyebrow mb-2">Current availability</p><p className="bis-copy">{definition.availability}</p></div>
      </div>
      <div className="bis-panel-pad">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><h3 className="bis-card-title">{definition.workspaceTitle}</h3><span className="flex items-center gap-2 text-xs leading-5 text-ink-muted"><Layers aria-hidden="true" className="size-3.5" />Intended structure · no live results</span></div>
        <dl className="grid gap-6 md:grid-cols-3">{definition.fields.map(([label, description], index) => <div key={label} className="border-t border-rule pt-4"><dt className="text-sm font-medium"><span aria-hidden="true" className="mr-3 font-mono text-xs text-brand">0{index + 1}</span>{label}</dt><dd className="bis-copy mt-3">{description}</dd></div>)}</dl>
      </div>
    </section>
    <section aria-labelledby="module-workflow"><div className="mb-5 flex flex-wrap items-baseline justify-between gap-3"><h2 id="module-workflow" className="bis-section-title">The intended workflow</h2><p className="text-xs text-ink-muted">Subject to backend support</p></div>
      <ol data-reveal className="bis-workflow bis-stagger">{definition.steps.map(([title, description], index) => <li key={title}><span className="pt-1 font-mono text-xs text-brand">0{index + 1}</span><div><h3 className="bis-card-title">{title}</h3><p className="bis-copy mt-1">{description}</p></div></li>)}</ol>
    </section>
    <section data-reveal className="grid gap-6 border-t border-rule pt-7 sm:grid-cols-2" aria-label="Evidence and next steps">
      <div className="flex gap-3"><ShieldQuestion aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" /><div><h2 className="bis-card-title">Evidence before conclusions</h2><p className="bis-copy mt-2">Missing sources and unresolved checks must remain visible. Verification Required is a useful outcome.</p></div></div>
      <div className="sm:pl-4"><p className="bis-copy mb-4">For document-based questions, Ask BIS is integrated. Responses depend on evidence and service availability.</p><Link href={navigation.askBis.href} className={cn(buttonVariants({ variant: "outline" }), "min-h-11 px-4")}><FileSearch aria-hidden="true" />Open Ask BIS<ArrowRight aria-hidden="true" className="bis-action-icon ml-2" /></Link></div>
    </section>
  </div>;
}

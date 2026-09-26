import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { ArrowDown, ArrowRight, BookOpen, Boxes, ClipboardCheck, FileSearch, Gem, Languages, Microscope, Scale, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProductPreview } from "@/components/landing/product-preview";
import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import styles from "./landing.module.css";

const editorial = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: "normal",
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: true,
});

const capabilities = [
  { title: "Standards Intelligence", icon: BookOpen, description: "Ask questions grounded in ingested standards documents.", emphasized: true, status: "Integrated · Ask BIS" },
  { title: "Product Applicability", icon: Boxes, description: "Connect product context to relevant standards and the reasons they apply.", emphasized: true, status: "Backend-dependent" },
  { title: "QCO / Mandatory Status", icon: Scale, description: "Understand obligations through applicable orders and their effective dates.", emphasized: true, status: "Backend-dependent" },
  { title: "Certification Guidance", icon: ClipboardCheck, description: "Navigate certification pathways and preparation requirements.", emphasized: false, status: "Backend-dependent" },
  { title: "Laboratory Guidance", icon: Microscope, description: "Explore testing needs and relevant laboratory information.", emphasized: false, status: "Backend-dependent" },
  { title: "Hallmarking", icon: Gem, description: "Find context for hallmarking requirements and related services.", emphasized: false, status: "Backend-dependent" },
  { title: "Evidence Explorer", icon: FileSearch, description: "Keep source references, excerpts, and verification context beside the answer.", emphasized: true, status: "Integrated · Ask BIS" },
  { title: "Multilingual Intelligence", icon: Languages, description: "Make standards easier to understand across languages, including Hindi.", emphasized: false, status: "Planned" },
] as const;

const workflow = [
  ["Understand", "Define the product, its use, and technical context."],
  ["Identify", "Find candidate standards and relevant requirements."],
  ["Verify", "Check applicability, sources, and unresolved questions."],
  ["Prepare", "Organize certification and testing requirements."],
  ["Act", "Use verified guidance to inform your next steps."],
  ["Track", "Keep a record of evidence and outstanding checks."],
] as const;

function ExploreLink({ className }: { className?: string }) {
  return (
    <Link href={navigation.dashboard.href} className={cn(buttonVariants(), "min-h-11 rounded-md bg-brand px-5 text-white hover:bg-brand/90", className)}>
      Explore Platform <ArrowRight aria-hidden="true" className="ml-2 size-4" />
    </Link>
  );
}

export default function Home() {
  return (
    <div className={cn(styles.landing, editorial.variable, "bis-landing bg-canvas text-ink")}>
      <a href="#main-content" className="sr-only z-50 bg-white p-4 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">Skip to content</a>
      <header className="border-b border-rule">
        <div className={cn(styles.container, "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 max-sm:gap-x-3 max-sm:py-4")}>
          <Link href="/" aria-label="BIS Intelligence home" className="flex items-center gap-2.5 font-semibold tracking-tight max-sm:gap-2 max-sm:text-sm">
            <ShieldCheck className="size-6 text-brand" aria-hidden="true" /> BIS Intelligence
          </Link>
          <nav aria-label="Main navigation" className="order-3 hidden w-full sm:flex gap-6 border-t border-rule pt-3 text-sm text-ink-muted md:order-0 md:w-auto md:border-0 md:pt-0">
            <a href="#product" className="py-2 hover:text-brand">Product</a>
            <a href="#capabilities" className="py-2 hover:text-brand">Capabilities</a>
            <a href="#trust" className="py-2 hover:text-brand">Trust</a>
          </nav>
          <div className="flex items-center gap-5">
            <Link href={navigation.askBis.href} className="hidden py-3 text-sm hover:text-brand sm:block">Ask BIS</Link>
            <ExploreLink className="px-3 text-[13px] sm:px-5 sm:text-sm" />
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section aria-labelledby="hero-title" className={cn(styles.container, "pt-12 pb-6 sm:pt-20 lg:pt-24")}>
          <p className={styles.eyebrow}><span className="mr-3 inline-block h-2 w-2 bg-brand" aria-hidden="true" />SIH26107 / Standards & compliance intelligence</p>
          <div className="bis-hero mt-7 grid items-center gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
            <h1 id="hero-title" className="bis-hero-title max-w-3xl">
              From product <span className="whitespace-nowrap">questions to</span> <span className="bis-editorial whitespace-nowrap text-brand">informed decisions.</span>
            </h1>
            <div className="lg:pt-3">
              <p className="max-w-md text-lg leading-8 text-ink-muted">A clearer path through Indian Standards. Designed to connect applicability, certification, and testing—with evidence at every step.</p>
              <div className="mt-7 flex flex-wrap items-center gap-6">
                <ExploreLink />
                <Link href={navigation.askBis.href} className="flex min-h-11 items-center gap-2 text-sm font-medium">Ask BIS <ArrowRight className="size-4" aria-hidden="true" /></Link>
              </div>
              <p className="mt-4 text-sm leading-6 sm:text-[13px] sm:leading-5 text-ink-muted">Ask BIS is integrated · service availability may vary</p>
            </div>
          </div>
          <div className="mt-12 border-t border-rule pt-6 sm:mt-14">
            <p className="mb-4 font-sans tabular-nums text-xs uppercase tracking-[var(--tracking-eyebrow)] text-ink-muted">The journey we’re building</p>
            <ol className="flex flex-wrap gap-x-4 gap-y-4 text-base sm:gap-y-3 sm:gap-x-6">
              {["Product", "Standard", "QCO", "Certification", "Testing", "Evidence"].map((step, index) => (
                <li key={step} className="flex items-center gap-4 sm:gap-6">
                  <span className={index === 5 ? "font-semibold text-brand" : "font-medium text-ink-muted"}>{step}</span>
                  {index < 5 && <ArrowRight aria-hidden="true" className="size-3.5 text-ink-muted" />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section data-reveal id="product" aria-labelledby="product-title" className={cn(styles.container, styles.section)}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div><p className={styles.eyebrow}>01 / Product intelligence</p><h2 id="product-title" className={styles.heading}>See the reasoning.<br />Not just the result.</h2></div>
            <p className="max-w-sm text-sm leading-6 text-ink-muted">A structured view of what applies, why it may apply, and what still needs verification.</p>
          </div>
          <ProductPreview />
        </section>

        <section data-reveal id="capabilities" aria-labelledby="capabilities-title" className="border-y border-rule bg-white">
          <div className={cn(styles.container, styles.section)}>
            <div className="grid gap-5 lg:grid-cols-2">
              <div><p className={styles.eyebrow}>02 / Connected capabilities</p><h2 id="capabilities-title" className={styles.heading}>One platform.<br />A wider view of compliance.</h2></div>
              <p className="max-w-md self-end text-sm leading-6 text-ink-muted lg:justify-self-end">Conversation is the starting point. The vision extends across the compliance journey. Ask BIS connects document questions with evidence. Other modules await backend availability; multilingual intelligence remains planned.</p>
            </div>
            <div className="mt-10 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map(({ title, icon: Icon, description, status, emphasized }) => (
                <article key={title} className={cn("flex flex-col border-t py-7", emphasized ? "border-brand/60" : "border-rule")}>
                  <Icon aria-hidden="true" className={cn("mb-5 size-5", emphasized ? "stroke-2 text-brand" : "stroke-[1.5] text-ink-muted")} />
                  <h3 className={cn("text-base tracking-tight", emphasized ? "font-semibold text-brand" : "font-medium")}>{title}</h3>
                  <p className="mt-2 mb-5 text-sm leading-6 text-ink-muted">{description}</p>
                  <p className="bis-meta mt-auto text-ink-muted">{status}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section data-reveal id="trust" aria-labelledby="trust-title" className={cn(styles.container, styles.section)}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
            <div>
              <p className={styles.eyebrow}>03 / Evidence first</p>
              <h2 id="trust-title" className={styles.heading}>Trust is a trail.<br />Not a confidence score.</h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-ink-muted">An answer should be open to inspection. Our trust model connects a claim to its source, keeps available document detail intact, and makes missing evidence visible.</p>
              <a href="#evidence-chain" className="mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-medium text-brand">Follow the evidence <ArrowDown aria-hidden="true" className="size-4" /></a>
            </div>
            <div>
              <div id="evidence-chain" className="scroll-mt-8 border border-rule bg-white p-5 sm:p-7">
                <p className="mb-6 font-sans tabular-nums text-xs uppercase tracking-[var(--tracking-eyebrow)] text-ink-muted">The evidence chain / intended traceability</p>
                <ol className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3">
                  {["Claim", "Evidence", "Document", "Page", "Clause", "Authority"].map((label, index) => (
                    <li key={label}>
                      <div className="flex items-center justify-between border-b border-rule pb-2"><span className="font-sans tabular-nums text-xs text-ink-muted">0{index + 1}</span>{index < 5 && <ArrowRight className="size-3.5 text-ink-muted" aria-hidden="true" />}</div>
                      <p className="mt-2 text-sm font-medium">{label}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 text-sm leading-6 text-ink-muted sm:text-xs sm:leading-5">Page, clause, and authority are shown only when supplied by the source. Missing details stay missing.</p>
              </div>
              <div className="mt-4 flex gap-4 border border-rule bg-brand-soft p-5 sm:p-6">
                <ShieldQuestion aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
                <div><h3 className="text-sm font-semibold text-brand">“Verification Required” is a useful answer.</h3><p className="mt-2 text-sm leading-6 text-ink-muted">When evidence is incomplete or conflicting, the right outcome is a clear next check—not a more confident guess.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section data-reveal aria-labelledby="workflow-title" className="border-t border-rule">
          <div className={cn(styles.container, styles.section)}>
            <p className={styles.eyebrow}>04 / How it works</p>
            <div className="flex flex-wrap items-end justify-between gap-5"><h2 id="workflow-title" className={styles.heading}>A considered path forward.</h2><Badge variant="outline" className="border-rule text-ink-muted">Intended workflow · in development</Badge></div>
            <ol className={cn(styles.workflow, "mt-10 grid gap-x-7 gap-y-8 sm:grid-cols-3 lg:grid-cols-6")}>
              {workflow.map(([title, description], index) => (
                <li key={title} className="border-t border-rule pt-4"><span className="font-sans tabular-nums text-xs text-brand">0{index + 1}</span><h3 className="mt-5 text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-muted sm:text-[13px]">{description}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section data-reveal aria-labelledby="cta-title" className="bg-brand text-white">
          <div className={cn(styles.container, "flex flex-wrap items-center justify-between gap-8 py-14 sm:py-20")}>
            <div><p className="font-sans tabular-nums text-xs uppercase tracking-[var(--tracking-eyebrow)] text-white/80">BIS Intelligence / Evidence-first workspace</p><h2 id="cta-title" className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Start with a question.<br />Build toward clarity.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/80">Explore the workspace and the capabilities taking shape.</p></div>
            <Link href={navigation.dashboard.href} className={cn(buttonVariants(), "h-12 rounded-md bg-white px-6 text-brand hover:bg-white/90")}>Enter the platform <ArrowRight aria-hidden="true" className="ml-3 size-4" /></Link>
          </div>
        </section>
      </main>
      <footer className={cn(styles.container, "flex flex-wrap items-center justify-between gap-6 py-8 text-sm leading-6 text-ink-muted sm:text-[13px]")}>
        <div><p className="font-medium text-ink">BIS Intelligence</p><p className="mt-2">SIH26107 · An independent hackathon prototype. Not an official BIS service.</p></div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-1"><Link href={navigation.dashboard.href} className="inline-flex min-h-11 items-center py-2">Platform</Link><Link href={navigation.askBis.href} className="inline-flex min-h-11 items-center py-2">Ask BIS</Link><a href="#trust" className="inline-flex min-h-11 items-center py-2">Our trust model</a></nav>
      </footer>
    </div>
  );
}

import { ArrowDown, Box, FileText, Link2, ScanLine, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProductPreview() {
  return (
    <figure className="overflow-hidden rounded-lg border border-rule bg-white shadow-dossier">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2 text-sm font-medium"><ScanLine className="size-4 text-brand" aria-hidden="true" /> Product intelligence</div>
        <Badge variant="outline" className="border-rule text-ink-muted max-sm:h-auto max-sm:whitespace-normal max-sm:py-1 max-sm:leading-5">Illustrative preview · not live</Badge>
      </div>
      <div className="grid lg:grid-cols-[0.85fr_1.5fr_1fr]">
        <div className="border-b border-rule bg-canvas/70 p-5 sm:p-7 lg:border-r lg:border-b-0">
          <p className="mb-5 font-sans tabular-nums text-xs leading-5 uppercase tracking-[var(--tracking-eyebrow)] text-ink-muted">01 / Understand</p>
          <Box className="mb-5 size-8 stroke-1 text-brand" aria-hidden="true" />
          <h3 className="text-lg font-medium tracking-tight">Product profile</h3>
          <p className="mt-2 text-sm sm:text-[13px] leading-6 text-ink-muted">The right question starts with the right context.</p>
          <dl className="mt-7 space-y-4 text-sm sm:text-[13px]">
            {[["Product", "Description needed"], ["Intended use", "Context needed"], ["Technical details", "Specifications needed"]].map(([label, value]) => (
              <div key={label} className="border-t border-rule pt-3"><dt className="text-ink-muted">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>
            ))}
          </dl>
        </div>
        <div className="p-5 sm:p-7">
          <p className="mb-5 font-sans tabular-nums text-xs leading-5 uppercase tracking-[var(--tracking-eyebrow)] text-ink-muted">02 / Establish applicability</p>
          <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-lg font-medium tracking-tight">Applicable standard</h3><span className="rounded border border-rule px-2 py-1 font-sans tabular-nums text-xs text-ink-muted">UNDETERMINED</span></div>
          <p className="mt-3 text-sm leading-6 text-ink-muted">A standard reference belongs here only when supported by relevant evidence.</p>
          <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-rule" /><ArrowDown className="size-4 text-ink-muted" aria-hidden="true" /><span className="h-px flex-1 bg-rule" /></div>
          <h4 className="text-sm sm:text-[13px] font-semibold">Why this standard?</h4>
          <p className="mt-2 text-sm sm:text-[13px] leading-6 text-ink-muted">Reasoning should connect product characteristics to the scope, exclusions, and supporting clauses.</p>
          <div className="mt-6 border-l-2 border-caution bg-caution-soft p-4 text-caution">
            <p className="flex items-center gap-2 text-sm sm:text-[13px] font-semibold"><ShieldQuestion className="size-4 shrink-0" aria-hidden="true" /> Verification Required</p>
            <p className="mt-2 text-sm sm:text-[13px] leading-6">Mandatory status is not determined. Applicable QCO evidence would need to be checked.</p>
          </div>
        </div>
        <div className="border-t border-rule bg-canvas/40 p-5 sm:p-7 lg:border-t-0 lg:border-l">
          <p className="mb-5 font-sans tabular-nums text-xs leading-5 uppercase tracking-[var(--tracking-eyebrow)] text-ink-muted">03 / Trace evidence</p>
          <div className="flex items-center gap-2"><FileText className="size-4 text-brand" aria-hidden="true" /><h3 className="text-sm font-medium">Source record</h3></div>
          <div className="mt-5 border border-rule bg-white p-4">
            <p className="mb-5 text-sm sm:text-[13px] font-medium">Document reference</p>
            <dl className="space-y-3 text-sm sm:text-[13px] text-ink-muted">
              {["Document ID", "Page", "Clause", "Authority"].map((label) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt>{label}</dt><dd>Not supplied</dd></div>)}
            </dl>
            <p className="mt-5 border-t border-rule pt-3 text-sm sm:text-[13px] leading-6 text-ink-muted">No source excerpt loaded.</p>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm sm:text-[13px] leading-6 text-ink-muted"><Link2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> Evidence supports the reasoning; missing evidence calls for verification.</p>
        </div>
      </div>
      <figcaption className="border-t border-rule px-5 py-3 text-sm leading-6 sm:text-xs text-ink-muted sm:px-7">Concept interface for a planned capability. No product has been assessed and no regulatory determination is shown.</figcaption>
    </figure>
  );
}

import { ExternalLink, FileText } from "lucide-react";
import { isRecord, safeSourceUrl } from "@/lib/bis/normalize";
import type { EvidenceRecord } from "@/lib/bis/types";

function label(key: string) {
  return key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
}

function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
}

function FieldValue({ value, depth }: { value: unknown; depth: number }) {
  if (depth > 8) return <span>Additional nested detail could not be displayed.</span>;
  if (typeof value === "string") {
    const url = safeSourceUrl(value);
    return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-start gap-1.5 text-brand underline underline-offset-4 focus-visible:outline-2"><span className="min-w-0 break-words [overflow-wrap:anywhere]">{value}</span><ExternalLink aria-hidden="true" className="mt-1 size-3.5 shrink-0" /><span className="sr-only"> (opens in a new tab)</span></a>
      : <span className="whitespace-pre-wrap">{value}</span>;
  }
  if (typeof value === "number") return <span>{value}</span>;
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (Array.isArray(value)) return <ul className="space-y-2">{value.filter(isPresent).map((item, index) => <li key={index}><FieldValue value={item} depth={depth + 1} /></li>)}</ul>;
  if (isRecord(value)) return <EvidenceFields record={value} depth={depth + 1} />;
  return null;
}

/** Render supplied keys, not a guessed citation schema. No raw JSON or HTML. */
export function EvidenceFields({ record, depth = 0 }: { record: EvidenceRecord; depth?: number }) {
  const entries = Object.entries(record).filter(([, value]) => isPresent(value));
  if (!entries.length) return <p className="text-sm text-ink-muted">No readable details supplied.</p>;
  return <dl className="space-y-4 text-sm leading-6 [overflow-wrap:anywhere]">{entries.map(([key, value]) => <div key={key} className="min-w-0"><dt className="mb-1 font-medium text-ink capitalize">{label(key)}</dt><dd className="text-ink-muted"><FieldValue value={value} depth={depth + 1} /></dd></div>)}</dl>;
}

export function EvidenceList({ title, items }: { title: string; items: EvidenceRecord[] }) {
  return <section className="min-w-0 space-y-3" aria-label={title}>
    <h3 className="flex items-center gap-2 text-sm font-semibold"><FileText aria-hidden="true" className="size-4 text-brand" />{title} <span className="font-mono text-xs text-ink-muted">({items.length})</span></h3>
    {items.length === 0 ? <p className="border border-dashed border-rule p-4 text-sm leading-6 text-ink-muted">No {title.toLowerCase()} supplied. This does not establish that the answer is verified.</p> : items.map((item, index) => (
      <details key={index} open={index === 0} className="rounded-md border border-rule bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand">{title === "Citations" ? "Citation" : "Source"} {index + 1}<span className="ml-2 text-xs font-normal text-ink-muted">Inspect supplied details</span></summary>
        <div className="mt-5 border-t border-rule pt-4"><EvidenceFields record={item} /></div>
      </details>
    ))}
  </section>;
}

import { FileSearch, ShieldQuestion } from "lucide-react";
import { EvidenceFields, EvidenceList } from "./evidence-list";
import { FormattedAnswer } from "./formatted-answer";
import { queryOutcome } from "@/lib/bis/outcome";
import { currentness, readableStatus } from "@/lib/bis/presentation";
import type { QuerySuccess } from "@/lib/bis/types";
import { cn } from "@/lib/utils";

export function QueryResultView({ result }: { result: QuerySuccess }) {
  const { data, notices } = result;
  const outcome = queryOutcome(data);
  const verification = outcome.label === "Verification Required";
  const hasCitations = data.citations.length > 0;
  const confidence = [
    data.confidence_level ? readableStatus(data.confidence_level) : null,
    data.confidence_score !== null ? String(data.confidence_score) : null,
  ].filter(Boolean).join(" · ") || "Not supplied";
  const summary = [
    ["Confidence", confidence],
    ["Grounding", data.grounding_status ? readableStatus(data.grounding_status) : "Not supplied"],
    ["Currentness", currentness(data)],
    ["Retrieved passages", data.retrieved_chunks !== null ? String(data.retrieved_chunks) : "Not supplied"],
  ];
  const provenance = {
    query_id: data.query_id, correlation_id: data.correlation_id,
    decision: data.decision, query_state: data.query_state,
    verification_required: data.verification_required,
    temporal_status: data.temporal_status, temporal_conflict: data.temporal_conflict,
    temporal_verification_required: data.temporal_verification_required,
    candidate_versions: data.candidate_versions, temporal_resolution: data.temporal_resolution,
  };
  return <section aria-labelledby="answer-heading" className="bis-result min-w-0 space-y-8 text-ink">
    <header className={cn("space-y-4 rounded-md border p-5 sm:p-6", outcome.review ? "border-caution/25 bg-caution-soft" : "border-rule bg-brand-soft")}>
      <p className="text-xs font-medium uppercase tracking-[var(--tracking-eyebrow)] text-ink-muted">Response & evidence</p>
      <h2 id="answer-heading" className={cn("flex items-start gap-3 text-xl font-semibold tracking-tight", outcome.review ? "text-caution" : "text-brand")}>
        {outcome.review ? <ShieldQuestion aria-hidden="true" focusable="false" className="mt-0.5 size-6 shrink-0" /> : <FileSearch aria-hidden="true" focusable="false" className="mt-0.5 size-6 shrink-0" />}
        <span>{data.decision === "qualified_answer" && !verification ? "Qualified Answer" : outcome.label}</span>
      </h2>
      {data.verification_reason ? <div className="text-sm text-ink-muted"><FormattedAnswer text={data.verification_reason} /></div>
        : verification ? <p className="text-sm leading-6 text-ink-muted">The available evidence does not support a verified conclusion. Review the sources and unresolved checks before acting.</p>
        : data.decision === "qualified_answer" ? <p className="text-sm leading-6 text-ink-muted">Read the qualifications alongside the supporting evidence.</p> : null}
      {data.query_state && <p className="text-sm font-medium text-ink-muted">{readableStatus(data.query_state)}</p>}
      <p className="border-t border-ink/10 pt-4 text-sm leading-7 [overflow-wrap:anywhere]"><span className="font-semibold">Question: </span>{data.query}</p>
    </header>

    {notices.length > 0 && <div className="space-y-2 border-l-2 border-caution pl-4 text-sm leading-6 text-ink-muted">{notices.map((notice) => <p key={notice}>{notice}</p>)}</div>}

    <article className="bis-panel bis-panel-pad">
      <h3 className="mb-5 text-lg font-medium">Answer</h3>
      <div className="text-base"><FormattedAnswer text={data.answer.trim() ? data.answer : "No answer text was supplied. Review the evidence and verification status."} /></div>
    </article>

    <section aria-labelledby="trust-summary-heading" className="space-y-5 border-y border-rule bg-canvas px-5 py-6 sm:px-7">
      <h3 id="trust-summary-heading" className="text-base font-semibold">Trust summary</h3>
      <dl className="grid min-w-0 grid-cols-1 gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {summary.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-ink-muted">{label}</dt><dd className="mt-1.5 font-medium leading-6 [overflow-wrap:anywhere]">{value}</dd></div>)}
      </dl>
      <p className="max-w-3xl text-sm leading-6 text-ink-muted"><strong className="font-medium text-ink">Grounded</strong> means the answer faithfully reflects retrieved evidence. <strong className="font-medium text-ink">Verification Required</strong> means that evidence is insufficient, conflicting, or temporally uncertain for a verified conclusion.</p>
      {data.grounding_reason && <div className="text-sm text-ink-muted"><FormattedAnswer text={data.grounding_reason} /></div>}
    </section>

    <section aria-labelledby="evidence-heading" className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="evidence-heading" className="text-lg font-semibold">Evidence</h3>
        <p className="text-sm text-ink-muted">{data.citations.length} citations · {data.sources.length} source records</p>
      </div>
      {data.evidence_summary && <div className="text-sm text-ink-muted"><FormattedAnswer text={data.evidence_summary} /></div>}
      {!hasCitations && <p className="text-sm leading-6 text-ink-muted">No citations were supplied. {data.sources.length ? "Available source records are shown below; they do not establish a verified conclusion." : "No supporting source records were supplied either."}</p>}
      <EvidenceList title={hasCitations ? "Citations" : "Sources"} items={hasCitations ? data.citations : data.sources} />
      {hasCitations && data.sources.length > 0 && <details className="bis-disclosure">
        <summary className="cursor-pointer py-3 text-sm font-medium text-ink-muted focus-visible:outline-2 focus-visible:outline-brand">Supporting source records ({data.sources.length})</summary>
        <p className="my-3 text-sm leading-6 text-ink-muted">These records may overlap with the citations above.</p>
        <EvidenceList title="Sources" items={data.sources} />
      </details>}
    </section>

    <details className="bis-disclosure">
      <summary className="cursor-pointer py-3 text-sm font-medium text-ink-muted focus-visible:outline-2 focus-visible:outline-brand">Inspect details · technical provenance</summary>
      <p className="my-3 text-sm leading-6 text-ink-muted">Original decision fields, response references, and version metadata supplied with this response.</p>
      <div className="rounded-md border border-rule bg-canvas p-5"><EvidenceFields record={provenance} /></div>
    </details>
  </section>;
}

import { FileSearch, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EvidenceFields, EvidenceList } from "./evidence-list";
import { queryOutcome } from "@/lib/bis/outcome";
import type { QuerySuccess } from "@/lib/bis/types";
import { cn } from "@/lib/utils";

export function QueryResultView({ result }: { result: QuerySuccess }) {
  const { data, notices } = result;
  const outcome = queryOutcome(data);
  const verification = outcome.label === "Verification Required";
  const hasTemporal = data.temporal_status || data.temporal_conflict || data.temporal_verification_required || data.temporal_resolution || data.candidate_versions.length > 0;
  return <section aria-labelledby="answer-heading" className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
      <h2 id="answer-heading" className="text-xl font-medium tracking-tight">Response & evidence</h2>
      <Badge variant="outline" className={cn("h-auto whitespace-normal px-3 py-1.5 text-sm", outcome.review ? "border-caution/30 bg-caution-soft text-caution" : "border-rule bg-brand-soft text-brand")}>
        {outcome.review ? <ShieldQuestion aria-hidden="true" /> : <FileSearch aria-hidden="true" />}{outcome.label}
      </Badge>
    </div>
    <p className="break-words text-sm leading-6 text-ink-muted"><span className="font-medium text-ink">Question: </span>{data.query}</p>
    {verification && <div className="border-l-2 border-caution bg-caution-soft p-5 text-sm leading-6 text-caution">
      <h3 className="font-semibold">More authoritative evidence is needed</h3>
      <p className="mt-2">The available evidence is not sufficient to treat this response as a verified conclusion. Review the reason and sources before acting.</p>
      {data.verification_reason && <p className="mt-3 whitespace-pre-wrap break-words">{data.verification_reason}</p>}
    </div>}
    {data.decision === "qualified_answer" && <p className="text-sm leading-6 text-caution">This answer carries qualifications. Read its limitations alongside the supporting evidence.</p>}
    {notices.length > 0 && <div className="space-y-2 border border-rule p-4 text-sm leading-6 text-ink-muted">{notices.map((notice) => <p key={notice}>{notice}</p>)}</div>}
    <div className="grid min-w-0 gap-8 xl:grid-cols-[1.15fr_1fr]">
      <div className="min-w-0 space-y-6">
        <article className="rounded-md border border-rule bg-white p-5 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold">Answer</h3>
          <p className="whitespace-pre-wrap text-base leading-8 [overflow-wrap:anywhere]">{data.answer.trim() ? data.answer : "No answer text was supplied. Review the evidence and verification status."}</p>
        </article>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          {data.confidence_level && <div><dt className="text-ink-muted">Confidence level</dt><dd className="mt-1 break-words font-medium">{data.confidence_level}</dd></div>}
          {data.confidence_score !== null && <div><dt className="text-ink-muted">Confidence score (as supplied)</dt><dd className="mt-1 font-mono">{data.confidence_score}</dd></div>}
          {data.grounding_status && <div><dt className="text-ink-muted">Grounding status</dt><dd className="mt-1 break-words font-medium">{data.grounding_status}</dd></div>}
          {data.query_state && <div><dt className="text-ink-muted">Query state</dt><dd className="mt-1 break-words">{data.query_state}</dd></div>}
          {data.retrieved_chunks !== null && <div><dt className="text-ink-muted">Retrieved passages</dt><dd className="mt-1 font-mono">{data.retrieved_chunks}</dd></div>}
        </dl>
        {data.grounding_reason && <p className="whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere]">{data.grounding_reason}</p>}
        {!verification && data.verification_reason && <p className="text-sm leading-6 [overflow-wrap:anywhere]">{data.verification_reason}</p>}
        {hasTemporal && <section className="space-y-3 border-t border-rule pt-5" aria-label="Currentness">
          <h3 className="text-sm font-semibold">Currentness & versions</h3>
          {data.temporal_status && <p className="break-words text-sm">{data.temporal_status}</p>}
          {data.temporal_conflict && <p className="text-sm text-caution">Temporal conflict reported. Current applicability needs verification.</p>}
          {data.temporal_verification_required && <p className="text-sm text-caution">Currentness verification is required.</p>}
          {data.candidate_versions.length > 0 && <p className="break-words text-sm">Candidate versions: {data.candidate_versions.join(", ")}</p>}
          {data.temporal_resolution && <EvidenceFields record={data.temporal_resolution} />}
        </section>}
        {(data.query_id || data.correlation_id) && <details className="border-t border-rule pt-4 text-xs text-ink-muted"><summary className="cursor-pointer py-2 focus-visible:outline-2">Response reference</summary><dl className="space-y-2 py-3 [overflow-wrap:anywhere]">{data.query_id && <div><dt>Query ID</dt><dd>{data.query_id}</dd></div>}{data.correlation_id && <div><dt>Correlation ID</dt><dd>{data.correlation_id}</dd></div>}</dl></details>}
      </div>
      <aside className="min-w-0 space-y-6" aria-label="Supporting evidence">
        {data.evidence_summary && <div><h3 className="mb-2 text-sm font-semibold">Evidence summary</h3><p className="whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere]">{data.evidence_summary}</p></div>}
        <EvidenceList title="Citations" items={data.citations} />
        <EvidenceList title="Sources" items={data.sources} />
      </aside>
    </div>
  </section>;
}

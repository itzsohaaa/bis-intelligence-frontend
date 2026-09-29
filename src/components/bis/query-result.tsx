import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileSearch,
  HelpCircle,
  Info,
  Microscope,
  ShieldCheck,
  ShieldQuestion,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { EvidenceFields, EvidenceList } from "./evidence-list";
import { FormattedAnswer } from "./formatted-answer";
import { queryOutcome, resolveUserFacingConclusion } from "@/lib/bis/outcome";
import {
  cleanUserFacingText,
  currentness,
  formatQualitativeConfidence,
  readableStatus,
} from "@/lib/bis/presentation";
import type { QuerySuccess } from "@/lib/bis/types";
import { cn } from "@/lib/utils";

export function QueryResultView({ result }: { result: QuerySuccess }) {
  const { data, notices } = result;
  const outcome = queryOutcome(data);
  const userConclusion = resolveUserFacingConclusion(data);
  const verification = outcome.label === "Verification Required" || outcome.review;
  const hasCitations = data.citations.length > 0;

  // Qualitative confidence for normal users, raw score preserved for forensic audit
  const qualitativeConfidence = formatQualitativeConfidence(
    data.confidence_level,
    data.confidence_score,
  );

  const trustMetrics = [
    [
      "Confidence",
      qualitativeConfidence,
      data.confidence_score !== null ? `Score: ${data.confidence_score}` : null,
    ],
    [
      "Grounding",
      data.grounding_status ? readableStatus(data.grounding_status) : "Not supplied",
      null,
    ],
    ["Currentness", currentness(data), null],
    [
      "Retrieved passages",
      data.retrieved_chunks !== null ? String(data.retrieved_chunks) : "Not supplied",
      null,
    ],
  ];

  const provenance = {
    query_id: data.query_id,
    correlation_id: data.correlation_id,
    decision: data.decision,
    query_state: data.query_state,
    verification_required: data.verification_required,
    temporal_status: data.temporal_status,
    temporal_conflict: data.temporal_conflict,
    temporal_verification_required: data.temporal_verification_required,
    candidate_versions: data.candidate_versions,
    temporal_resolution: data.temporal_resolution,
  };

  const hasClaims = Boolean(data.claims && data.claims.length > 0);
  const hasCandidates = Boolean(
    data.candidate_standards && data.candidate_standards.length > 0,
  );
  const hasScheme = Boolean(data.scheme_recommendation);
  const hasLabs = Boolean(data.laboratories && data.laboratories.length > 0);

  // Clean answer text without raw [EV1], [EV2] tags for user-facing simplicity
  const displayAnswer = cleanUserFacingText(data.answer.trim());

  return (
    <section
      aria-labelledby="answer-heading"
      className="bis-result min-w-0 space-y-6 text-ink"
    >
      {/* 1. Header: Progressive Disclosure Tier 1 (Status, Conclusion, Reason) */}
      <header
        className={cn(
          "space-y-4 rounded-lg border p-5 sm:p-6 shadow-xs transition-colors",
          userConclusion.badgeType === "VERIFIED"
            ? "border-emerald-300/60 bg-emerald-50/40"
            : userConclusion.badgeType === "INSUFFICIENT_EVIDENCE"
              ? "border-slate-300/80 bg-slate-50/70"
              : userConclusion.badgeType === "QUALIFIED"
                ? "border-blue-300/60 bg-blue-50/40"
                : "border-amber-300/70 bg-amber-50/50",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-muted">
            Statutory Verification & Evidence
          </p>

          {/* Status Badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border shadow-2xs",
              userConclusion.badgeType === "VERIFIED"
                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                : userConclusion.badgeType === "INSUFFICIENT_EVIDENCE"
                  ? "border-slate-300 bg-slate-200 text-slate-800"
                  : userConclusion.badgeType === "QUALIFIED"
                    ? "border-blue-300 bg-blue-100 text-blue-800"
                    : "border-amber-300 bg-amber-100 text-amber-900",
            )}
          >
            {userConclusion.badgeType === "VERIFIED" ? (
              <CheckCircle2 className="size-3.5" />
            ) : userConclusion.badgeType === "INSUFFICIENT_EVIDENCE" ? (
              <HelpCircle className="size-3.5" />
            ) : userConclusion.badgeType === "QUALIFIED" ? (
              <Info className="size-3.5" />
            ) : (
              <AlertTriangle className="size-3.5" />
            )}
            <span>{userConclusion.badgeLabel}</span>
          </span>
        </div>

        {/* Conclusion Headline */}
        <h2
          id="answer-heading"
          className={cn(
            "text-xl sm:text-2xl font-bold tracking-tight",
            userConclusion.badgeType === "VERIFIED"
              ? "text-emerald-900"
              : userConclusion.badgeType === "INSUFFICIENT_EVIDENCE"
                ? "text-slate-800"
                : userConclusion.badgeType === "QUALIFIED"
                  ? "text-blue-900"
                  : "text-amber-950",
          )}
        >
          {userConclusion.headline}
        </h2>

        {/* Plain-Language Reason */}
        <p className="text-sm leading-relaxed text-ink/80 max-w-3xl">
          {userConclusion.plainReason}
        </p>

        {data.query_state && (
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Pipeline State: {readableStatus(data.query_state)}
          </p>
        )}

        <div className="border-t border-ink/10 pt-3 text-xs leading-relaxed [overflow-wrap:anywhere] text-ink-muted">
          <span className="font-semibold text-ink">Inquiry: </span>
          {data.query}
        </div>
      </header>

      {notices.length > 0 && (
        <div className="space-y-2 border-l-2 border-caution pl-4 text-sm leading-6 text-ink-muted">
          {notices.map((notice) => (
            <p key={notice}>{notice}</p>
          ))}
        </div>
      )}

      {/* 2. Primary Direct Answer */}
      <article className="bis-panel bis-panel-pad shadow-xs">
        <h3 className="mb-4 text-base font-semibold text-ink flex items-center gap-2">
          <FileSearch className="size-4 text-brand" />
          Direct Assessment
        </h3>
        <div className="text-base leading-relaxed text-ink">
          <FormattedAnswer
            text={
              displayAnswer.length > 0
                ? displayAnswer
                : "No answer text was supplied. Review the evidence and verification status."
            }
          />
        </div>
      </article>

      {/* 3. Candidate Standards: Collapsible to avoid visual competition / false confirmation */}
      {hasCandidates && (
        <details
          className="bis-disclosure group rounded-md border border-rule bg-canvas shadow-xs"
          open={false}
        >
          <summary className="flex cursor-pointer items-center justify-between p-4 sm:p-5 font-semibold text-ink select-none hover:bg-canvas-subtle transition-colors">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-brand" />
              <span>
                Identified Candidate Standards ({data.candidate_standards!.length})
              </span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Not Confirmed
              </span>
            </div>
            <ChevronDown className="size-4 text-ink-muted transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="border-t border-rule p-4 sm:p-5 space-y-4">
            <p className="text-xs text-ink-muted">
              These candidate standards were found in the BIS catalog for this product category.
              Specific applicability has not been verified against authoritative scope clauses.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.candidate_standards!.map((candidate) => (
                <div
                  key={candidate.standard_number}
                  className="flex flex-col justify-between rounded-md border border-rule bg-canvas-subtle/50 p-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans font-bold text-brand">
                        {candidate.standard_number}
                      </span>
                      {candidate.is_mandatory && (
                        <span className="rounded bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                          Mandatory QCO
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-ink">{candidate.title}</p>
                    {candidate.match_reason && (
                      <p className="mt-1 text-xs text-ink-muted">
                        {candidate.match_reason}
                      </p>
                    )}
                    {candidate.qco_number && (
                      <p className="mt-2 text-xs font-medium text-brand">
                        Order: {candidate.qco_number}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-rule pt-3 text-xs">
                    <Link
                      href={`/laboratories?standard=${encodeURIComponent(candidate.standard_number)}`}
                      className="font-medium text-brand hover:underline"
                    >
                      View Testing Labs →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}

      {/* 4. Scheme Recommendation (if applicable) */}
      {hasScheme && (
        <section
          aria-labelledby="scheme-heading"
          className="bis-panel bis-panel-pad space-y-3 bg-brand-soft/40 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Award className="size-5 text-brand" />
            <h3 id="scheme-heading" className="text-base font-semibold">
              Certification Scheme Recommendation
            </h3>
          </div>
          <div className="rounded-md border border-brand/20 bg-white p-4">
            <p className="text-sm font-semibold text-brand">
              {String(data.scheme_recommendation!.scheme_name || "Applicable Scheme")}
            </p>
            {Boolean(data.scheme_recommendation!.rationale) && (
              <p className="mt-2 text-sm text-ink-muted">
                {String(data.scheme_recommendation!.rationale)}
              </p>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs">
              <Link
                href="/certification"
                className="font-medium text-brand underline underline-offset-2 hover:text-brand/80"
              >
                Open 5-Step Certification Roadmap →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Accredited Laboratories (if applicable) */}
      {hasLabs && (
        <section
          aria-labelledby="labs-heading"
          className="bis-panel bis-panel-pad space-y-3 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Microscope className="size-5 text-brand" />
            <h3 id="labs-heading" className="text-base font-semibold">
              Accredited Testing Facilities ({data.laboratories!.length})
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.laboratories!.map((lab, idx) => (
              <div
                key={idx}
                className="rounded-md border border-rule bg-canvas p-3.5 text-sm"
              >
                <p className="font-semibold text-ink">
                  {String(lab.name || "BIS Laboratory")}
                </p>
                <p className="text-xs text-ink-muted">
                  {String(lab.city || "")}, {String(lab.state || "")} · NABL:{" "}
                  <span className="font-mono font-medium text-ink">
                    {String(lab.accreditation_number || "Verified")}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Progressive Disclosure Tier 2: Forensic Verification, Citations & Entailment Drawer */}
      <details
        className="bis-disclosure group rounded-lg border border-rule bg-canvas shadow-xs"
        data-tour="ask-bis-evidence"
      >
        <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold text-ink select-none hover:bg-canvas-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-brand" />
            <span className="text-base">
              View verification details & evidence ({data.citations.length} citations ·{" "}
              {data.claims?.length || 0} claims · {data.sources.length} sources)
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
            Expand Details
            <ChevronDown className="size-4 text-brand transition-transform duration-200 group-open:rotate-180" />
          </span>
        </summary>

        <div className="border-t border-rule p-5 sm:p-7 space-y-8">
          {/* Trust Summary */}
          <section aria-labelledby="trust-summary-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-2">
              <h3 id="trust-summary-heading" className="text-sm font-bold uppercase tracking-wider text-ink">
                Trust & Verification Audit
              </h3>
              <span className="text-xs text-ink-muted">Forensic Integrity</span>
            </div>
            <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trustMetrics.map(([label, value, subtext]) => (
                <div key={label} className="rounded-md border border-rule/80 bg-canvas-subtle/40 p-3 min-w-0">
                  <dt className="text-xs text-ink-muted">{label}</dt>
                  <dd className="mt-1 font-semibold text-sm leading-6 [overflow-wrap:anywhere]">
                    {value}
                  </dd>
                  {subtext && (
                    <dd className="mt-0.5 text-xs font-mono text-ink-muted">
                      {subtext}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
            <p className="text-xs leading-relaxed text-ink-muted">
              <strong className="font-medium text-ink">Grounded</strong> means the answer
              faithfully reflects retrieved evidence.{" "}
              <strong className="font-medium text-ink">Verification Required</strong> means
              that evidence is insufficient, conflicting, or temporally uncertain for an
              unqualified conclusion.
            </p>
            {data.grounding_reason && (
              <div className="text-xs text-ink-muted rounded border border-rule p-3 bg-canvas-subtle/30">
                <FormattedAnswer text={data.grounding_reason} />
              </div>
            )}
          </section>

          {/* Claim-Level Evidence Explorer */}
          {hasClaims && (
            <section aria-labelledby="claims-heading" className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
                <h4 id="claims-heading" className="text-sm font-bold uppercase tracking-wider text-ink">
                  Claim-Level Entailment Explorer ({data.claims!.length})
                </h4>
                <span className="text-xs text-ink-muted">
                  Independently verified against statutory text
                </span>
              </div>
              <div className="space-y-3">
                {data.claims!.map((claim, index) => {
                  const isSupported = claim.entailment_status === "SUPPORTED";
                  const isRefuted = claim.entailment_status === "REFUTED";
                  return (
                    <div
                      key={index}
                      className="rounded-md border border-rule bg-canvas p-4 text-sm space-y-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="font-medium text-ink leading-relaxed">
                          {claim.claim_text}
                        </p>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
                            isSupported
                              ? "bg-green-100 text-green-800"
                              : isRefuted
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800",
                          )}
                        >
                          {isSupported ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : isRefuted ? (
                            <XCircle className="size-3.5" />
                          ) : (
                            <HelpCircle className="size-3.5" />
                          )}
                          {claim.entailment_status}
                        </span>
                      </div>
                      {claim.citation_keys && claim.citation_keys.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                          <span>Citations:</span>
                          {claim.citation_keys.map((k) => (
                            <span
                              key={k}
                              className="rounded bg-brand/10 px-1.5 py-0.5 font-mono text-xs text-brand font-semibold"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                      {claim.verification_note && (
                        <p className="rounded bg-amber-50/70 p-2 text-xs text-amber-900 border border-amber-200/50">
                          <strong>Verification Note:</strong> {claim.verification_note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Citations & Evidence List */}
          <section aria-labelledby="evidence-heading" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
              <h4 id="evidence-heading" className="text-sm font-bold uppercase tracking-wider text-ink">
                Authoritative Citations & Passages
              </h4>
              <p className="text-xs text-ink-muted">
                {data.citations.length} citations · {data.sources.length} source records
              </p>
            </div>
            {data.evidence_summary && (
              <div className="text-xs text-ink-muted">
                <FormattedAnswer text={data.evidence_summary} />
              </div>
            )}
            {!hasCitations && (
              <p className="text-xs leading-6 text-ink-muted">
                No citations were supplied.{" "}
                {data.sources.length
                  ? "Available source records are shown below; they do not establish a verified conclusion."
                  : "No supporting source records were supplied either."}
              </p>
            )}
            <EvidenceList
              title={hasCitations ? "Citations" : "Sources"}
              items={hasCitations ? data.citations : data.sources}
            />
            {hasCitations && data.sources.length > 0 && (
              <details className="bis-disclosure pt-2">
                <summary className="cursor-pointer py-2 text-xs font-semibold text-ink-muted hover:text-ink">
                  Supporting source records ({data.sources.length})
                </summary>
                <p className="my-2 text-xs text-ink-muted">
                  These records may overlap with the citations above.
                </p>
                <EvidenceList title="Sources" items={data.sources} />
              </details>
            )}
          </section>

          {/* Technical Provenance Details */}
          <details className="bis-disclosure pt-2">
            <summary className="cursor-pointer py-2 text-xs font-semibold text-ink-muted hover:text-ink">
              Inspect technical provenance & identifiers
            </summary>
            <p className="my-2 text-xs text-ink-muted">
              Cryptographic and runtime identifiers, decision flags, and candidate version
              hashes supplied by the BIS engine.
            </p>
            <div className="rounded-md border border-rule bg-canvas p-4 text-xs">
              <EvidenceFields record={provenance} />
            </div>
          </details>
        </div>
      </details>
    </section>
  );
}

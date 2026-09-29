import type {
  BISDecision,
  CandidateStandard,
  ClaimRecord,
  EvidenceRecord,
  QueryRequest,
  QuerySuccess,
} from "./types";

export function isRecord(value: unknown): value is EvidenceRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateQuery(value: unknown): QueryRequest | null {
  if (
    !isRecord(value) ||
    typeof value.query !== "string" ||
    !value.query.trim() ||
    typeof value.top_k !== "number" ||
    !Number.isSafeInteger(value.top_k) ||
    value.top_k <= 0
  )
    return null;

  const req: QueryRequest = { query: value.query.trim(), top_k: value.top_k };
  if (value.audience === "consumer" || value.audience === "expert") {
    req.audience = value.audience;
  }
  if (typeof value.language === "string" && value.language.trim()) {
    req.language = value.language.trim();
  }
  if (isRecord(value.context)) {
    req.context = value.context;
  }
  return req;
}

export function isKnownDecision(value: unknown): value is BISDecision {
  return (
    value === "answer" ||
    value === "qualified_answer" ||
    value === "verification_required" ||
    value === "abstain"
  );
}

export function normalizeQueryResponse(value: unknown): QuerySuccess | null {
  if (
    !isRecord(value) ||
    typeof value.query !== "string" ||
    typeof value.answer !== "string"
  )
    return null;
  const notices = new Set<string>();
  const invalid = () =>
    notices.add(
      "Some response metadata was missing or unreadable. Review the available evidence before relying on this answer.",
    );
  const text = (key: string) => {
    const field = value[key];
    if (field == null) return null;
    if (typeof field === "string") return field.trim() ? field : null;
    invalid();
    return null;
  };
  const number = (key: string) => {
    const field = value[key];
    if (field == null) return null;
    if (typeof field === "number" && Number.isFinite(field)) return field;
    invalid();
    return null;
  };
  const flag = (key: string) => {
    if (value[key] != null && typeof value[key] !== "boolean") invalid();
    return value[key] === true;
  };
  const records = (key: string) => {
    const field = value[key];
    if (field == null) {
      if (key === "sources") invalid();
      return [];
    }
    if (!Array.isArray(field)) {
      invalid();
      return [];
    }
    if (field.some((item) => !isRecord(item))) invalid();
    return field.filter(isRecord);
  };
  const decision = text("decision");
  if (!isKnownDecision(decision))
    notices.add(
      "The backend did not supply a recognized decision. No verification status can be inferred from the answer alone.",
    );
  const versions = value.candidate_versions;
  if (
    versions != null &&
    (!Array.isArray(versions) || versions.some((v) => typeof v !== "string"))
  )
    invalid();
  const resolution = value.temporal_resolution;
  if (resolution != null && !isRecord(resolution)) invalid();
  const chunks = number("retrieved_chunks");
  const validChunks =
    chunks !== null && Number.isSafeInteger(chunks) && chunks >= 0;
  if (!validChunks) invalid();

  // Parse structured claims if present
  let claims: ClaimRecord[] | undefined = undefined;
  if (Array.isArray(value.claims)) {
    claims = value.claims
      .filter(isRecord)
      .map((c) => ({
        claim_text: typeof c.claim_text === "string" ? c.claim_text : "",
        entailment_status: typeof c.entailment_status === "string" ? c.entailment_status : "UNKNOWN",
        citation_keys: Array.isArray(c.citation_keys) ? c.citation_keys.filter((k): k is string => typeof k === "string") : [],
        verification_note: typeof c.verification_note === "string" ? c.verification_note : null,
      }))
      .filter((c) => c.claim_text.length > 0);
  }

  // Parse candidate standards if present
  let candidate_standards: CandidateStandard[] | undefined = undefined;
  if (Array.isArray(value.candidate_standards)) {
    candidate_standards = value.candidate_standards
      .filter(isRecord)
      .map((cs) => ({
        standard_number: typeof cs.standard_number === "string" ? cs.standard_number : "",
        title: typeof cs.title === "string" ? cs.title : "",
        score: typeof cs.score === "number" ? cs.score : undefined,
        match_reason: typeof cs.match_reason === "string" ? cs.match_reason : undefined,
        is_mandatory: typeof cs.is_mandatory === "boolean" ? cs.is_mandatory : undefined,
        qco_number: typeof cs.qco_number === "string" ? cs.qco_number : null,
      }))
      .filter((cs) => cs.standard_number.length > 0);
  }

  const scheme_rec = isRecord(value.scheme_recommendation) ? value.scheme_recommendation : null;
  const cert_checklist = Array.isArray(value.certification_checklist) ? value.certification_checklist.filter(isRecord) : null;
  const labs = Array.isArray(value.laboratories) ? value.laboratories.filter(isRecord) : null;

  const data = {
    query: value.query,
    answer: value.answer,
    query_id: text("query_id"),
    correlation_id: text("correlation_id"),
    decision,
    query_state: text("query_state"),
    verification_required: flag("verification_required"),
    verification_reason: text("verification_reason"),
    evidence_summary: text("evidence_summary"),
    confidence_score: number("confidence_score"),
    confidence_level: text("confidence_level"),
    grounding_status: text("grounding_status"),
    grounding_reason: text("grounding_reason"),
    temporal_status: text("temporal_status"),
    temporal_conflict: flag("temporal_conflict"),
    temporal_verification_required: flag("temporal_verification_required"),
    temporal_resolution: isRecord(resolution) ? resolution : null,
    candidate_versions: Array.isArray(versions)
      ? versions.filter((v): v is string => typeof v === "string")
      : [],
    retrieved_chunks: validChunks ? chunks : null,
    citations: records("citations"),
    sources: records("sources"),
    claims,
    candidate_standards,
    scheme_recommendation: scheme_rec,
    certification_checklist: cert_checklist,
    laboratories: labs,
  };
  return { data, notices: [...notices] };
}

/** Only http(s) source links are navigable; metadata never becomes markup. */
export function safeSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

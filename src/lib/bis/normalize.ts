import type { BISDecision, EvidenceRecord, QueryRequest, QuerySuccess } from "./types";

export function isRecord(value: unknown): value is EvidenceRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateQuery(value: unknown): QueryRequest | null {
  if (!isRecord(value) || typeof value.query !== "string" || !value.query.trim() ||
      typeof value.top_k !== "number" || !Number.isSafeInteger(value.top_k) || value.top_k <= 0) return null;
  return { query: value.query.trim(), top_k: value.top_k };
}

export function isKnownDecision(value: unknown): value is BISDecision {
  return value === "answer" || value === "qualified_answer" || value === "verification_required";
}

export function normalizeQueryResponse(value: unknown): QuerySuccess | null {
  if (!isRecord(value) || typeof value.query !== "string" || typeof value.answer !== "string") return null;
  const notices = new Set<string>();
  const invalid = () => notices.add("Some response metadata was missing or unreadable. Review the available evidence before relying on this answer.");
  const text = (key: string) => {
    const field = value[key];
    if (field == null) return null;
    if (typeof field === "string") return field.trim() ? field : null;
    invalid(); return null;
  };
  const number = (key: string) => {
    const field = value[key];
    if (field == null) return null;
    if (typeof field === "number" && Number.isFinite(field)) return field;
    invalid(); return null;
  };
  const flag = (key: string) => {
    if (value[key] != null && typeof value[key] !== "boolean") invalid();
    return value[key] === true;
  };
  const records = (key: string) => {
    const field = value[key];
    if (field == null) { if (key === "sources") invalid(); return []; }
    if (!Array.isArray(field)) { invalid(); return []; }
    if (field.some((item) => !isRecord(item))) invalid();
    return field.filter(isRecord);
  };
  const decision = text("decision");
  if (!isKnownDecision(decision)) notices.add("The backend did not supply a recognized decision. No verification status can be inferred from the answer alone.");
  const versions = value.candidate_versions;
  if (versions != null && (!Array.isArray(versions) || versions.some((v) => typeof v !== "string"))) invalid();
  const resolution = value.temporal_resolution;
  if (resolution != null && !isRecord(resolution)) invalid();
  const chunks = number("retrieved_chunks");
  const validChunks = chunks !== null && Number.isSafeInteger(chunks) && chunks >= 0;
  if (!validChunks) invalid();
  const data = {
    query: value.query, answer: value.answer,
    query_id: text("query_id"), correlation_id: text("correlation_id"), decision,
    query_state: text("query_state"),
    verification_required: flag("verification_required"), verification_reason: text("verification_reason"),
    evidence_summary: text("evidence_summary"),
    confidence_score: number("confidence_score"), confidence_level: text("confidence_level"),
    grounding_status: text("grounding_status"), grounding_reason: text("grounding_reason"),
    temporal_status: text("temporal_status"), temporal_conflict: flag("temporal_conflict"),
    temporal_verification_required: flag("temporal_verification_required"),
    temporal_resolution: isRecord(resolution) ? resolution : null,
    candidate_versions: Array.isArray(versions) ? versions.filter((v): v is string => typeof v === "string") : [],
    retrieved_chunks: validChunks ? chunks : null,
    citations: records("citations"), sources: records("sources"),
  };
  return { data, notices: [...notices] };
}

/** Only http(s) source links are navigable; metadata never becomes markup. */
export function safeSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

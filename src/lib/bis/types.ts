/** Focused view of QueryResponse from docs/api/openapi.json.
 * Evidence objects intentionally remain open: the contract has no field schema.
 * Missing/invalid optional values normalize to null, never inferred facts.
 */
export type BISDecision = "answer" | "qualified_answer" | "verification_required";
export type EvidenceRecord = Record<string, unknown>;
export type QueryRequest = { query: string; top_k: number };

export type QueryResult = {
  query: string;
  answer: string;
  query_id: string | null;
  correlation_id: string | null;
  decision: string | null;
  query_state: string | null;
  verification_required: boolean;
  verification_reason: string | null;
  evidence_summary: string | null;
  confidence_score: number | null;
  confidence_level: string | null;
  grounding_status: string | null;
  grounding_reason: string | null;
  temporal_status: string | null;
  temporal_conflict: boolean;
  temporal_verification_required: boolean;
  temporal_resolution: EvidenceRecord | null;
  candidate_versions: string[];
  retrieved_chunks: number | null;
  citations: EvidenceRecord[];
  sources: EvidenceRecord[];
};

/** BFF envelope, not an additional backend capability. */
export type QuerySuccess = { data: QueryResult; notices: string[] };

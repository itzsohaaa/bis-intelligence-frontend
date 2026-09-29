/** Focused view of QueryResponse from docs/api/openapi.json.
 * Evidence objects intentionally remain open: the contract has no field schema.
 * Missing/invalid optional values normalize to null, never inferred facts.
 */
export type BISDecision = "answer" | "qualified_answer" | "verification_required" | "abstain";
export type EvidenceRecord = Record<string, unknown>;

export type ClaimRecord = {
  claim_text: string;
  entailment_status: "SUPPORTED" | "REFUTED" | "NOT_SUPPORTED" | string;
  citation_keys?: string[];
  verification_note?: string | null;
};

export type CandidateStandard = {
  standard_number: string;
  title: string;
  score?: number;
  match_reason?: string;
  is_mandatory?: boolean;
  qco_number?: string | null;
};

export type QueryRequest = {
  query: string;
  top_k: number;
  audience?: "expert" | "consumer";
  language?: string;
  context?: Record<string, unknown>;
};

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
  claims?: ClaimRecord[];
  candidate_standards?: CandidateStandard[];
  scheme_recommendation?: Record<string, unknown> | null;
  certification_checklist?: Array<Record<string, unknown>> | null;
  laboratories?: EvidenceRecord[] | null;
  product_context?: Record<string, unknown> | null;
};

/** BFF envelope, not an additional backend capability. */
export type QuerySuccess = { data: QueryResult; notices: string[] };

/** Testing Laboratory record from SQLite laboratories table. */
export type LaboratoryRecord = {
  lab_id: string;
  name: string;
  city: string;
  state: string;
  accreditation_number: string;
  scope_of_testing: string[];
  created_at?: number;
  address?: string | null;
  address_source_url?: string | null;
  address_source_title?: string | null;
  address_verified_at?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  google_place_id?: string | null;
  google_maps_url?: string | null;
};

export type LaboratoriesResponse = {
  standard_number: string;
  laboratories: LaboratoryRecord[];
  total_laboratories: number;
};

/** Standard metadata from standards_metadata_catalog table. */
export type StandardCatalogRecord = {
  standard_number: string;
  title: string;
  year?: number;
  edition_or_version?: string;
  status: string;
  category: string;
  technical_committee?: string;
  ics_code?: string;
  applicable_products: string[];
  mandatory_qco_number?: string | null;
  is_mandatory: boolean;
  source_url?: string;
  license_status?: string;
  full_text_available: boolean;
  document_id?: string | null;
  created_at?: number;
  updated_at?: number;
};

/** Corpus and coverage statistics from backend. */
export type CoverageStats = {
  timestamp: string;
  status: string;
  jurisdiction: string;
  counts: {
    discovered_documents: number;
    standards_metadata: number;
    eligible_documents: number;
    downloaded_documents: number;
    indexed_chunks: number;
    clauses: number;
    qcos: number;
    amendments: number;
    schemes: number;
    laboratories: number;
    test_methods: number;
    products: number;
    knowledge_relationships: number;
    sources: number;
    blocked_by_rights: number;
    failed_downloads: number;
  };
  rights_breakdown: Record<string, number>;
  sectors: string[];
  release?: {
    release_id: string;
    version: string;
    timestamp: string;
  };
};

/** Runtime provenance information. */
export type RuntimeProvenance = {
  status: string;
  collection_name: string;
  chunks_indexed: number;
  llm_available: boolean;
  llm_last_error?: string | null;
  source_commit: string;
  release_id: string;
  image_digest: string;
  build_timestamp: string;
  models: {
    embedding_model: string;
    reranker_model: string;
    generator_model: string | null;
  };
};

export type DashboardStatsResponse = {
  coverage: CoverageStats;
  provenance: RuntimeProvenance;
};

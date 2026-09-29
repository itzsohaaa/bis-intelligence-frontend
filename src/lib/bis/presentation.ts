import type { EvidenceRecord, QueryResult } from "./types";

export function readableStatus(value: string): string {
  const words = value.replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface PrimarySourceIdentifier {
  standardNumber: string;
  title?: string;
  isMandatory?: boolean;
  qcoNumber?: string | null;
}

export interface FormattedUserAnswer {
  directAnswer: string;
  primarySource: PrimarySourceIdentifier | null;
  verificationNote: string | null;
  status: {
    label: string;
    type: "VERIFIED" | "VERIFICATION_REQUIRED" | "INSUFFICIENT_EVIDENCE" | "QUALIFIED";
  };
  headline: string;
  hasConflict: boolean;
}

export function cleanUserFacingText(text: string): string {
  if (!text) return "";
  return text
    // Remove raw citation tags like [EV1], [DOC2], [PASSAGE3]
    .replace(/\s*\[(?:EV\d+|DOC\d+|PASSAGE\d+|CITATION\d+)\]/gi, "")
    // Remove raw PIPELINE STATE prefix if present
    .replace(/^PIPELINE STATE:\s*[A-Z_\s-]+(?:\n|$)/gi, "")
    // Remove raw Inquiry echo if present
    .replace(/^Inquiry:\s*.*?(?:\n|$)/gi, "")
    // Remove internal diagnostic parameter tags
    .replace(/\s*\((?:unsupported_terms:[^)]*|unsupported_numerical_value:[^)]*|Grounding validation detected[^)]*)\)/gi, "")
    .trim();
}

export function isInternalPipelineBoilerplate(text: string): boolean {
  if (!text) return true;
  const t = text.trim();
  return (
    /^(?:Verification Required:\s*)?The generated response contains ungrounded claims/i.test(t) ||
    /^Grounding validation detected/i.test(t) ||
    /^Grounding failure:/i.test(t) ||
    /^Retrieved passages contain contradictory/i.test(t) ||
    /^PIPELINE STATE:\s*/i.test(t) ||
    /Manual regulatory verification is required\.?$/i.test(t)
  );
}

export function extractTopicFromQuery(query: string): string {
  if (!query) return "";
  return query
    .replace(/^(?:what does |what is the scope of |what is the |what standard applies to |which standard is for |is there an? |bis standard for |standards? for |is for )/i, "")
    .replace(/(?:say about|specify about|require for|stand for|apply to)\s+/i, "")
    .replace(/\b(?:standard|provisions?|requirements?|specification)\b/gi, "")
    .replace(/\bIS\s*\d+(?:\s*\([^)]+\)|\s*:\s*\d+)?\b/gi, "")
    .replace(/[?.,!]+/g, "")
    .trim();
}

export function resolvePrimarySource(data: QueryResult): PrimarySourceIdentifier | null {
  // 1. Check citations for standard number
  if (data.citations && data.citations.length > 0) {
    for (const c of data.citations) {
      if (typeof c.standard_number === "string" && c.standard_number.trim()) {
        const std = c.standard_number.trim();
        const cand = data.candidate_standards?.find((cs) => cs.standard_number === std);
        const titleStr = typeof c.standard_title === "string" ? c.standard_title : cand?.title;
        return {
          standardNumber: std,
          title: titleStr || undefined,
          isMandatory: cand?.is_mandatory,
          qcoNumber: cand?.qco_number ?? undefined,
        };
      }
    }
  }

  // 2. Check candidate standards
  if (data.candidate_standards && data.candidate_standards.length > 0) {
    const first = data.candidate_standards[0];
    if (first.standard_number) {
      return {
        standardNumber: first.standard_number.trim(),
        title: first.title || undefined,
        isMandatory: first.is_mandatory,
        qcoNumber: first.qco_number ?? undefined,
      };
    }
  }

  // 3. Check sources
  if (data.sources && data.sources.length > 0) {
    for (const s of data.sources) {
      if (typeof s.standard_number === "string" && s.standard_number.trim()) {
        return {
          standardNumber: s.standard_number.trim(),
          title: typeof s.standard_title === "string" ? s.standard_title : undefined,
        };
      }
    }
  }

  // 4. Check query regex for standard number (e.g. IS 9873, IS 694, IS 1293)
  const queryMatch = data.query?.match(/\b(IS\s*\d+(?:(?:\s*\(Part\s*\d+\))|\s*:\s*\d+)?)\b/i);
  if (queryMatch) {
    return {
      standardNumber: queryMatch[1].trim().toUpperCase(),
    };
  }

  return null;
}

export function formatUserFacingAnswer(data: QueryResult): FormattedUserAnswer {
  const primarySource = resolvePrimarySource(data);
  const rawAnswer = data.answer ? data.answer.trim() : "";
  const isBoilerplate = isInternalPipelineBoilerplate(rawAnswer);

  const hasConflict = Boolean(
    data.query_state === "CONFLICTING_EVIDENCE" ||
    data.temporal_conflict ||
    /contradictory mandatory vs prohibitory/i.test(rawAnswer) ||
    /conflicting evidence/i.test(rawAnswer)
  );

  const isInsufficient = Boolean(
    data.decision === "abstain" ||
    (data.retrieved_chunks === 0 && (!data.sources || data.sources.length === 0)) ||
    data.grounding_status?.toLowerCase() === "ungrounded"
  );

  const isUngrounded = Boolean(
    data.grounding_status?.toLowerCase().includes("ungrounded") ||
    data.grounding_status?.toLowerCase().includes("unsupported")
  );

  const isGrounded =
    typeof data.grounding_status === "string" &&
    data.grounding_status.toLowerCase().includes("grounded") &&
    !isUngrounded;

  const isVerified =
    data.decision === "answer" &&
    Boolean(isGrounded) &&
    !data.verification_required &&
    !data.temporal_verification_required &&
    !hasConflict &&
    !isInsufficient;

  // Determine Status Badge & Headline
  let status: FormattedUserAnswer["status"];
  let headline: string;

  if (isVerified) {
    status = { label: "Verified", type: "VERIFIED" };
    headline = "Verified Compliance Standard";
  } else if (isInsufficient) {
    status = { label: "Insufficient Evidence", type: "INSUFFICIENT_EVIDENCE" };
    headline = "Insufficient Evidence in BIS Corpus";
  } else if (data.decision === "qualified_answer") {
    status = { label: "Qualified Answer", type: "QUALIFIED" };
    headline = "Qualified Answer";
  } else {
    status = { label: "Verification Required", type: "VERIFICATION_REQUIRED" };
    headline = "Verification Required";
  }

  // Determine Direct Answer
  let directAnswer: string;

  if (!rawAnswer) {
    directAnswer = "No answer text was supplied. Review the evidence and verification status.";
  } else if (isInsufficient) {
    directAnswer = "Based on the retrieved provisions, this requirement could not be verified with sufficient certainty.";
  } else if (!isBoilerplate && rawAnswer.length > 0) {
    // If the answer is legitimate domain text, clean it and use it directly
    directAnswer = cleanUserFacingText(rawAnswer);
  } else {
    // The backend returned internal pipeline/grounding diagnostic text.
    // Synthesize the direct answer from the retrieved evidence and primary standard.
    if (primarySource?.standardNumber) {
      const topic = extractTopicFromQuery(data.query);
      if (topic) {
        directAnswer = `${primarySource.standardNumber} covers the relevant ${topic} requirements described in the retrieved standard provisions.`;
      } else {
        directAnswer = `${primarySource.standardNumber} covers the relevant compliance requirements described in the retrieved standard provisions.`;
      }
    } else {
      directAnswer = "Based on the retrieved provisions, this requirement could not be verified with sufficient certainty.";
    }
  }

  // Determine Optional Verification Note
  let verificationNote: string | null = null;

  if (hasConflict) {
    verificationNote = "Conflicting evidence: The retrieved provisions contain conflicting interpretations, so the specific requirement should be verified against the cited standard text.";
  } else if (isInsufficient) {
    verificationNote = "No authoritative Indian Standard or gazetted order matching this query was found in the indexed regulatory corpus.";
  } else if (data.candidate_standards && data.candidate_standards.length > 0 && !isVerified) {
    verificationNote = "The query matches candidate standards in the BIS catalog. Review the candidate list below to inspect individual scope clauses and determine statutory applicability.";
  } else if (!isVerified) {
    verificationNote = "Specific requirements could not be verified with sufficient certainty against authoritative standard text. Review the cited provisions before taking compliance action.";
  }

  return {
    directAnswer,
    primarySource,
    verificationNote,
    status,
    headline,
    hasConflict,
  };
}

export function formatQualitativeConfidence(level?: string | null, score?: number | null): string {
  if (level) {
    const l = level.toLowerCase();
    if (l === "high") return "High Confidence";
    if (l === "medium") return "Moderate Confidence";
    if (l === "low") return "Low Confidence (Verification Advised)";
    return readableStatus(level);
  }
  if (typeof score === "number") {
    if (score >= 0.8) return "High Confidence";
    if (score >= 0.5) return "Moderate Confidence";
    return "Requires Human Verification";
  }
  return "Not supplied";
}

export function currentness(result: QueryResult): string {
  const status = result.temporal_status ? readableStatus(result.temporal_status) : null;
  if (result.temporal_conflict) return status ? `${status} · conflicting evidence` : "Conflicting evidence";
  if (result.temporal_verification_required) return status ? `${status} · verification required` : "Verification required";
  return status ?? "Not supplied";
}

// Display adapters only. These optional aliases are not a new backend schema.
// Every original field stays inspectable, even when not recognized for the card.
const fields = [
  ["Standard", ["standard_number", "standard_no", "is_number"]],
  ["Year", ["standard_year", "year"]],
  ["Clause", ["clause", "clause_number"]],
  ["Title", ["clause_title", "title", "source_title", "document_title"]],
  ["Table", ["table", "table_number"]],
  ["Page", ["page", "page_number", "page_no", "pages"]],
  ["Source file", ["filename", "file_name", "source_file"]],
  ["Excerpt", ["excerpt", "text", "content", "chunk_text"]],
  ["Verifiable", ["verifiable", "is_verifiable"]],
  ["Verification state", ["verification_state", "verification_status"]],
  ["Source URL", ["canonical_url", "source_url", "url"]],
] as const;

function scalar(value: unknown): string | null {
  if (typeof value === "string") return value.trim() ? value : null;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value) && value.every((item) => typeof item === "string" || typeof item === "number")) return value.length ? value.join(", ") : null;
  return null;
}

export function citationFields(record: EvidenceRecord) {
  const metadata = record.metadata;
  const containers = [record, ...(metadata && typeof metadata === "object" && !Array.isArray(metadata) ? [metadata as EvidenceRecord] : [])];
  return fields.flatMap(([label, keys]) => {
    for (const container of containers) {
      for (const key of keys) {
        const value = scalar(container[key]);
        if (value !== null) return [{ label, value }];
      }
    }
    return [];
  });
}

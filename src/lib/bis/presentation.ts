import type { EvidenceRecord, QueryResult } from "./types";

export function readableStatus(value: string): string {
  const words = value.replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function cleanUserFacingText(text: string): string {
  if (!text) return "";
  return text.replace(/\s*\[(?:EV\d+|DOC\d+|PASSAGE\d+|CITATION\d+)\]/gi, "");
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

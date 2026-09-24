import type { QueryResult } from "./types";

export function queryOutcome(result: QueryResult) {
  if (result.decision === "verification_required" || result.verification_required || result.temporal_verification_required || result.temporal_conflict) {
    return { label: "Verification Required", review: true };
  }
  if (result.decision === "qualified_answer") return { label: "Qualified answer", review: true };
  if (result.decision === "answer") return { label: "Answer", review: false };
  return { label: "Decision unavailable", review: true };
}

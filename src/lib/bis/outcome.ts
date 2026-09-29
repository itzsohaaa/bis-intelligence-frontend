import type { QueryResult } from "./types";

export interface OutcomeResolution {
  label: string;
  review: boolean;
  statusType?: "VERIFIED" | "VERIFICATION_REQUIRED" | "INSUFFICIENT_EVIDENCE" | "QUALIFIED";
}

export function queryOutcome(result: QueryResult): OutcomeResolution {
  if (
    result.decision === "verification_required" ||
    result.decision === "abstain" ||
    result.verification_required ||
    result.temporal_verification_required ||
    result.temporal_conflict
  ) {
    return {
      label: "Verification Required",
      review: true,
      statusType: "VERIFICATION_REQUIRED",
    };
  }
  if (result.decision === "qualified_answer") {
    return {
      label: "Qualified answer",
      review: true,
      statusType: "QUALIFIED",
    };
  }
  if (result.decision === "answer") {
    return {
      label: "Answer",
      review: false,
      statusType: "VERIFIED",
    };
  }
  return {
    label: "Decision unavailable",
    review: true,
    statusType: "INSUFFICIENT_EVIDENCE",
  };
}

export interface UserFacingConclusion {
  headline: string;
  badgeLabel: string;
  badgeType: "VERIFIED" | "VERIFICATION_REQUIRED" | "INSUFFICIENT_EVIDENCE" | "QUALIFIED";
  plainReason: string;
  isCandidateAmbiguity: boolean;
}

export function resolveUserFacingConclusion(data: QueryResult): UserFacingConclusion {
  const candidateCount = data.candidate_standards?.length || 0;
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
    !data.temporal_conflict;

  // Harmonize contradictory wording:
  // When candidate standards exist but none are established/verified as applicable,
  // do NOT say "No standard identified" followed by candidate standards.
  if (candidateCount > 0 && !isVerified) {
    const rawProduct =
      (data.product_context && typeof data.product_context === "object" && typeof data.product_context.product_name === "string"
        ? data.product_context.product_name
        : null) ||
      data.query
        .replace(/^(?:what is the |what standard applies to |which standard is for |is there an? |bis standard for |standards? for |is for )/i, "")
        .replace(/\?+$/, "")
        .trim() ||
      "this product";

    return {
      headline: "Verification Required",
      badgeLabel: "Verification Required",
      badgeType: "VERIFICATION_REQUIRED",
      plainReason:
        data.verification_reason ||
        "Based on the retrieved provisions, this requirement could not be verified with sufficient certainty.",
      isCandidateAmbiguity: true,
    };
  }

  if (isVerified) {
    return {
      headline: "Verified Compliance Standard",
      badgeLabel: "Verified",
      badgeType: "VERIFIED",
      plainReason:
        data.verification_reason ||
        "Grounded in authoritative Indian Standard clauses and gazetted Quality Control Orders.",
      isCandidateAmbiguity: false,
    };
  }

  if (
    data.decision === "abstain" ||
    (data.retrieved_chunks === 0 && (!data.sources || data.sources.length === 0)) ||
    data.grounding_status === "UNGROUNDED" ||
    data.grounding_status === "ungrounded"
  ) {
    return {
      headline: "Insufficient Evidence in BIS Corpus",
      badgeLabel: "Insufficient Evidence",
      badgeType: "INSUFFICIENT_EVIDENCE",
      plainReason:
        data.verification_reason ||
        "No authoritative Indian Standard or gazetted order matching this query was found in the indexed regulatory corpus.",
      isCandidateAmbiguity: false,
    };
  }

  if (data.decision === "qualified_answer") {
    return {
      headline: "Qualified Answer",
      badgeLabel: "Qualified Answer",
      badgeType: "QUALIFIED",
      plainReason:
        data.verification_reason ||
        "Read the statutory qualifications alongside the supporting evidence.",
      isCandidateAmbiguity: false,
    };
  }

  return {
    headline: "Verification Required",
    badgeLabel: "Verification Required",
    badgeType: "VERIFICATION_REQUIRED",
    plainReason:
      data.verification_reason ||
      "The available evidence does not support an unreserved verified conclusion. Review the sources and claim entailment before taking commercial or legal action.",
    isCandidateAmbiguity: false,
  };
}

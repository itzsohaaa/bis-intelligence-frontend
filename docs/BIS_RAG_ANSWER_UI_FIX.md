# BIS Frontend Answer Presentation Fix

## 1. Executive Summary

This release resolves the presentation defect where internal RAG pipeline states, retrieval diagnostics, and raw query echoes were displayed directly in the user-facing answer card in `bis-intelligence-frontend`.

The underlying forensic verification, grounding, provenance, claim entailment, and temporal currentness checks remain **100% active and uncompromised**, but complexity is now structured according to the core UX principle:
> **Complexity lives in the verification drawer, while clarity lives in the answer.**

---

## 2. Root Cause Analysis

1. **Diagnostic Text Passthrough**: When the BIS backend flagged ungrounded claims or conflicting provisions, the generator returned raw diagnostic strings such as:
   - `PIPELINE STATE: CONFLICTING EVIDENCE`
   - `Inquiry: What does IS 9873 say about toy safety?`
   - `Verification Required: The generated response contains ungrounded claims that could not be verified against authoritative BIS standard text (Grounding validation detected 2 unsupported claim(s).). Manual regulatory verification is required.`
   - `(unsupported_terms: ...)` and citation tokens like `[EV1] [EV2]`.
   The frontend previously rendered `data.answer` verbatim without a presentation filter.

2. **Awkward Candidate Ambiguity Strings**: The outcome handler previously constructed awkward user-facing messages like:
   - *"I found 1 possible standard, but I couldn't verify which one applies to What does IS 9873 say about toy safety."*

3. **Substring Collision in Grounding Status**: An evaluation expression `data.grounding_status.includes("un")` evaluated to `true` for `"fully_grounded"` because `"groUNded"` contains the substring `"un"`. This incorrectly downgraded verified standards into verification-required states.

---

## 3. Architecture & Files Changed

### `src/lib/bis/presentation.ts`
- **`cleanUserFacingText(text: string): string`**: Cleans citation tokens (`[EV1]`, `[DOC2]`), `PIPELINE STATE:` headers, `Inquiry:` echoes, and diagnostic parentheticals from legitimate domain answers.
- **`isInternalPipelineBoilerplate(text: string): boolean`**: Identifies diagnostic boilerplate strings and redirects to clean synthesized presentation.
- **`resolvePrimarySource(data: QueryResult): PrimarySourceIdentifier | null`**: Deterministically resolves the authoritative standard number, title, QCO mandatory status, and gazette order from citations, candidate standards, sources, or query regex.
- **`formatUserFacingAnswer(data: QueryResult): FormattedUserAnswer`**:
  - Implements the strict visual hierarchy:
    1. **Direct Answer**: Clean domain answer or direct statement of standard coverage.
    2. **Optional Verification Note**: Natural explanation of conflicting evidence, candidate review, or insufficient corpus coverage without raw pipeline tags.
    3. **Primary Source Identifier**: Standard number, title, mandatory QCO badge, and interactive `View Evidence` trigger.
    4. **Status & Headline**: Clean badges (Verified, Verification Required, Insufficient Evidence, Qualified).
  - Explicit check for `isUngrounded` (`"ungrounded"` or `"unsupported"`) preventing substring false positives on `"grounded"`.
  - Deterministic fallback for empty answers: `"No answer text was supplied. Review the evidence and verification status."`.

### `src/lib/bis/outcome.ts`
- Updated candidate ambiguity handling: Replaced awkward string concatenations with concise, professional regulatory language.
- Replaced ambiguous substring grounding check with explicit `typeof string` and `!isUngrounded` validation.

### `src/components/bis/query-result.tsx`
- Refactored user answer presentation to present the clean direct answer card:
  - Header: Displays "Answer" with clean status badge (no internal `Inquiry:` or `PIPELINE STATE:`).
  - Body: Direct answer text.
  - Verification Note: Prominent amber callout when verification or conflict is present.
  - Source bar: Standard number and title with a direct `View Evidence (N)` button that automatically opens and scrolls to `#bis-evidence-drawer`.
- Tier 2 Forensic Drawer (`#bis-evidence-drawer`): Preserves full auditability (Trust & Verification Audit, Claim-Level Entailment Explorer, Citations & Passages, Technical Provenance).

### `tests/bis-presentation.test.mjs`
- Added comprehensive unit tests for `formatUserFacingAnswer`, candidate standard presentation, empty answers, conflicting evidence, and pipeline diagnostic suppression.
- Fixed module resolution by compiling JSX/TS in `.tmp/` for bun test execution.

---

## 4. Before / After UX Comparison

| Feature / State | Before (Internal Leaks) | After (Clean Presentation) |
|---|---|---|
| **Conflicting Evidence (e.g. IS 9873)** | Answer: `PIPELINE STATE: CONFLICTING EVIDENCE\nInquiry: What does IS 9873 say about toy safety?\nVerification Required: The generated response contains ungrounded claims...` | **Direct Answer**: `IS 9873 covers the relevant toy safety requirements described in the retrieved standard provisions.`<br>**Verification note**: `Conflicting evidence: The retrieved provisions contain conflicting interpretations, so the specific requirement should be verified against the cited standard text.`<br>**Source**: `IS 9873 · Safety of Toys` [View Evidence] |
| **Candidate Ambiguity (e.g. pressure cooker)** | Answer: `I found 2 possible standards, but I couldn't verify which one applies to IS for pressure cooker.` | **Direct Answer**: `Pressure cookers must comply with IS 2347.`<br>**Verification note**: `The query matches candidate standards in the BIS catalog. Review the candidate list below to inspect individual scope clauses and determine statutory applicability.`<br>**Source**: `IS 2347:2017 · Domestic Pressure Cookers` [View Evidence] |
| **Negative Control (e.g. IS 99999)** | Raw abstain diagnostic text | **Direct Answer**: `Based on the retrieved provisions, this requirement could not be verified with sufficient certainty.`<br>**Verification note**: `No authoritative Indian Standard or gazetted order matching this query was found in the indexed regulatory corpus.`<br>**Status**: `Insufficient Evidence` |
| **Verified Standard (e.g. IS 694)** | Direct answer with embedded `[EV1] [EV2]` tokens | **Direct Answer**: `IS 694:2010 specifies requirements for PVC cables up to 1100 V.`<br>**Verification note**: None<br>**Status**: `Verified` (Green badge) |

---

## 5. Verification & Test Evidence

### Unit & Integration Suite
```
$ bun test tests/*.test.mjs
bun test v1.3.4 (5eb2145b)

tests\bis-capabilities.test.mjs: 4 pass
tests\bis-huid.test.mjs: 2 pass
tests\bis-laboratory-location.test.mjs: 9 pass
tests\bis-presentation.test.mjs: 7 pass
tests\bis.test.mjs: 5 pass
tests\motion.test.mjs: 5 pass

32 pass, 0 fail across 6 files
```

### TypeScript Validation
```
$ bunx tsc --noEmit
Exit code: 0 (Zero errors)
```

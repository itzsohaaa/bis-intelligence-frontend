import type { PlatformPage } from "./navigation";

export type ModulePage = Exclude<PlatformPage, "dashboard" | "askBis">;
type ModuleDefinition = { eyebrow: string; purpose: string; availability: string; workspaceTitle: string; fields: readonly [string, string][]; steps: readonly [string, string][] };

export const modules = {
  productIntelligence: {
    eyebrow: "Product / Applicability", purpose: "From product context to a reasoned compliance path.",
    availability: "Complete product-to-standard and QCO decisioning awaits backend availability. This workspace outlines the intended structure; it does not generate mappings or decisions.",
    workspaceTitle: "A product brief, before a conclusion",
    fields: [["Product & intended use", "The product, its function, and who will use it."], ["Technical context", "Materials, specifications, and the questions that need checking."], ["Applicability & evidence", "Candidate requirements, reasoning, and unresolved verification checks."]],
    steps: [["Product", "Understand the product and its intended use."], ["Applicable standard", "Identify candidates and explain relevance."], ["QCO / applicability", "Verify obligations and effective dates."], ["Certification", "Establish the relevant certification pathway."], ["Testing", "Understand testing requirements in context."], ["Evidence", "Keep sources beside each conclusion."]],
  },
  standards: {
    eyebrow: "Standards / Discovery", purpose: "Find the scope. Follow the source.",
    availability: "Dedicated standards search and structured details await backend availability. Document questions can be submitted through Ask BIS; this page does not run a live search.",
    workspaceTitle: "Designed for source-led exploration",
    fields: [["Search context", "A standard number, subject, or technical question."], ["Scope & references", "The supplied scope, clauses, and document references."], ["Version & currentness", "Available dates and version evidence, with uncertainty retained."]],
    steps: [["Discover", "Start with a subject or a known standard."], ["Read in context", "Examine the scope and relevant passages."], ["Trace the evidence", "Check source references and currentness."]],
  },
  certification: {
    eyebrow: "Certification / Preparation", purpose: "A clearer path from requirements to preparation.",
    availability: "A complete certification workflow is not yet supported. Scheme selection, requirements, and application preparation will need confirmed backend support and evidence.",
    workspaceTitle: "An intended preparation workspace",
    fields: [["Scheme context", "Product and applicability evidence needed to identify a pathway."], ["Preparation", "Requirements and documents, linked to their sources."], ["Review", "Outstanding checks before taking the next step."]],
    steps: [["Identify the scheme", "Establish the applicable pathway with evidence."], ["Understand requirements", "Read the obligations in their source context."], ["Prepare documents", "Organize the supported preparation requirements."], ["Understand the process", "Review the relevant steps and dependencies."], ["Verify", "Resolve uncertainties before acting."]],
  },
  laboratories: {
    eyebrow: "Testing / Laboratories", purpose: "Start with the testing need. Then find the fit.",
    availability: "The laboratory finder is awaiting backend integration. No laboratory listings, availability, or accreditation claims are presented here.",
    workspaceTitle: "Testing context comes first",
    fields: [["Testing requirement", "The relevant standard and testing question."], ["Laboratory scope", "Evidence needed to assess whether a laboratory is appropriate."], ["Source review", "The origin and currentness of supplied laboratory information."]],
    steps: [["Identify the requirement", "Understand the testing context from evidence."], ["Discover laboratories", "Find relevant information when supported."], ["Review suitability", "Verify scope and source details before proceeding."]],
  },
  hallmarking: {
    eyebrow: "Hallmarking / Regulatory evidence", purpose: "Keep requirements and regulatory context together.",
    availability: "The backend has limited hallmarking-related evidence, not a complete decision system. This dedicated workspace awaits support; Ask BIS responses remain limited to the evidence available.",
    workspaceTitle: "A framework for informed review",
    fields: [["Requirement context", "The hallmarking question and its relevant circumstances."], ["Order & currentness", "Applicable source material and any temporal uncertainty."], ["Verification", "Evidence gaps that prevent a reliable conclusion."]],
    steps: [["Understand", "Frame the requirement without assuming eligibility."], ["Examine the order", "Read relevant regulatory evidence in context."], ["Verify currentness", "Check dates, applicability, and unresolved questions."]],
  },
  passport: {
    eyebrow: "Compliance / Continuity", purpose: "A future record of what applies—and why.",
    availability: "The Compliance Passport is a planned product concept. Backend functionality is not implemented, and no passport records or completion states are created here.",
    workspaceTitle: "An intended evidence record",
    fields: [["Standards & obligations", "Applicable requirements with their supporting evidence."], ["Certification & testing", "Source-backed context for certification and testing state."], ["Verification history", "A record of checks, uncertainty, and the evidence used."]],
    steps: [["Consolidate", "Bring requirements and evidence into one record."], ["Review", "Keep verified findings and open questions distinct."], ["Track", "Preserve verification history as evidence changes."]],
  },
} satisfies Record<ModulePage, ModuleDefinition>;

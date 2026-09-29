"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Layers,
  LoaderCircle,
  Microscope,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageIntro } from "@/components/platform/page-intro";
import { useBISQuery } from "@/features/ask-bis/use-bis-query";
import { validateQuery } from "@/lib/bis/normalize";
import { FormattedAnswer } from "./formatted-answer";

const productPresets = [
  {
    name: "PVC Insulated Cables",
    specs: "Working voltage up to and including 1100V, copper conductor, building wire",
    origin: "domestic",
  },
  {
    name: "Domestic Plugs and Sockets",
    specs: "250V rated voltage, 16A rated current, 3-pin configuration",
    origin: "domestic",
  },
  {
    name: "Children Toy (Plastic)",
    specs: "Mechanical and physical safety for children under 14 years of age",
    origin: "domestic",
  },
  {
    name: "Smart Electricity Meter",
    specs: "a.c. static direct connected watt-hour smart meter, Class 1 and 2",
    origin: "domestic",
  },
  {
    name: "Overseas Manufactured Electric Cables",
    specs: "Industrial flexible cables manufactured at an overseas facility for export to India",
    origin: "foreign",
  },
  {
    name: "Antigravity Space Boots (Negative Control)",
    specs: "Zero-gravity levitation footwear with quantum magnetic thrusters",
    origin: "foreign",
  },
];

export function ProductIntelligenceWorkspace() {
  const [productName, setProductName] = useState("");
  const [techSpecs, setTechSpecs] = useState("");
  const [origin, setOrigin] = useState<"domestic" | "foreign">("domestic");
  const { state, submit, cancel } = useBISQuery();
  const loading = state.status === "loading";

  function handlePreset(preset: (typeof productPresets)[0]) {
    setProductName(preset.name);
    setTechSpecs(preset.specs);
    setOrigin(preset.origin as "domestic" | "foreign");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || !productName.trim()) return;

    const fullPrompt = `Assess regulatory compliance and BIS applicability for the product: "${productName.trim()}". Technical parameters: "${techSpecs.trim()}". Manufacturer origin: ${origin === "foreign" ? "Foreign / Overseas factory exporting to India" : "Domestic Indian manufacturer"}. Identify candidate standards, mandatory QCO obligations, applicable certification scheme, and testing requirements.`;

    const input = validateQuery({
      query: fullPrompt,
      top_k: 6,
      audience: "expert",
      context: {
        product_name: productName.trim(),
        technical_specification: techSpecs.trim(),
        manufacturer_origin: origin,
      },
    });

    if (input) {
      void submit(input);
    }
  }

  const queryResult = state.status === "success" ? state.result.data : null;
  const isUnverified =
    queryResult &&
    (queryResult.verification_required ||
      queryResult.decision === "verification_required" ||
      queryResult.decision === "abstain");

  return (
    <div className="bis-stack">
      <PageIntro
        eyebrow="Product / Applicability Engine"
        title="Product Intelligence"
        description="Evaluate product scope, candidate Indian Standards, mandatory QCO orders, and certification pathways."
        status="available"
      />

      <div className="flex items-start gap-3 border-l-2 border-brand/50 pl-4">
        <Boxes aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
        <p className="bis-copy">
          Autonomous regulatory assessment pipeline. Evaluates candidate standards, gazetted
          Quality Control Orders (QCOs), certification schemes (Scheme I vs X), and testing scopes
          from verified evidence.
        </p>
      </div>

      {/* Product Assessment Form */}
      <form
        onSubmit={onSubmit}
        className="bis-panel bis-panel-pad space-y-5 shadow-dossier"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="prod-name" className="mb-2 block text-sm font-semibold">
              Product Name / Commercial Identity
            </label>
            <Input
              id="prod-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Polyvinyl chloride insulated cables, Plugs and sockets…"
              disabled={loading}
              required
              className="h-11 bg-white text-base!"
            />
          </div>

          <div>
            <label htmlFor="prod-origin" className="mb-2 block text-sm font-semibold">
              Manufacturing Origin
            </label>
            <div className="inline-flex h-11 w-full rounded-md border border-rule bg-canvas p-1">
              <button
                type="button"
                onClick={() => setOrigin("domestic")}
                className={`flex-1 rounded text-xs font-semibold transition-colors ${
                  origin === "domestic"
                    ? "bg-brand text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Domestic (Manufactured in India)
              </button>
              <button
                type="button"
                onClick={() => setOrigin("foreign")}
                className={`flex-1 rounded text-xs font-semibold transition-colors ${
                  origin === "foreign"
                    ? "bg-brand text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Overseas (Exporting to India)
              </button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="prod-specs" className="mb-2 block text-sm font-semibold">
            Technical Parameters & Materials Context
          </label>
          <Textarea
            id="prod-specs"
            value={techSpecs}
            onChange={(e) => setTechSpecs(e.target.value)}
            placeholder="e.g. Working voltage 1100V, single phase, copper conductor, intended for domestic installations…"
            disabled={loading}
            className="min-h-24 bg-canvas p-3 text-base!"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
          <div className="flex flex-wrap gap-2">
            {productPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                disabled={loading}
                onClick={() => handlePreset(preset)}
                className="rounded bg-brand/5 px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/10 disabled:opacity-50"
              >
                + {preset.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {loading && (
              <Button type="button" variant="outline" onClick={cancel} className="h-11 px-4">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || !productName.trim()}
              className="h-11 bg-brand px-6 text-white hover:bg-brand/90"
            >
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {loading ? "Analyzing Scope…" : "Run Applicability Assessment"}
            </Button>
          </div>
        </div>
      </form>

      {/* Query Result Pipeline */}
      {queryResult && (
        <section aria-labelledby="pipeline-results" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
            <div>
              <h2 id="pipeline-results" className="text-lg font-semibold text-ink">
                Regulatory Decision Pipeline: {productName}
              </h2>
              <p className="text-xs text-ink-muted">
                Origin: {origin === "foreign" ? "Overseas (FMCS)" : "Domestic (ISI Mark)"} ·{" "}
                Confidence: {queryResult.confidence_level || "Grounded"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  isUnverified
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-green-100 text-green-900 border border-green-300"
                }`}
              >
                {isUnverified ? "Verification Required" : "Grounded & Verified"}
              </span>
            </div>
          </div>

          {/* 6-Stage Visual Pipeline */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Step 1: Candidate Standard */}
            <div className="rounded-md border border-rule bg-canvas p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand">STAGE 01</span>
                <Scale className="size-4 text-brand" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-ink">Candidate Standard</h3>
              {queryResult.candidate_standards && queryResult.candidate_standards.length > 0 ? (
                <div className="mt-2 space-y-1">
                  <p className="font-bold text-brand">
                    {queryResult.candidate_standards[0].standard_number}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {queryResult.candidate_standards[0].title}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-ink-muted">
                  Standard scope extracted from retrieved passages.
                </p>
              )}
            </div>

            {/* Step 2: Statutory QCO Obligation */}
            <div className="rounded-md border border-rule bg-canvas p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand">STAGE 02</span>
                <ShieldAlert className="size-4 text-accent" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-ink">Mandatory QCO Order</h3>
              <div className="mt-2">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                    queryResult.candidate_standards?.[0]?.is_mandatory ||
                    queryResult.answer.toLowerCase().includes("mandatory")
                      ? "bg-accent-soft text-accent"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {queryResult.candidate_standards?.[0]?.is_mandatory ||
                  queryResult.answer.toLowerCase().includes("mandatory")
                    ? "Mandatory Statutory QCO"
                    : "Voluntary / Specific Scope"}
                </span>
                {queryResult.candidate_standards?.[0]?.qco_number && (
                  <p className="mt-1 text-xs text-ink-muted">
                    Order: {queryResult.candidate_standards[0].qco_number}
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Certification Scheme */}
            <div className="rounded-md border border-rule bg-canvas p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand">STAGE 03</span>
                <FileCheck2 className="size-4 text-brand" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-ink">Certification Scheme</h3>
              <p className="mt-2 text-xs font-semibold text-brand">
                {origin === "foreign"
                  ? "Scheme X (Foreign Manufacturers Certification - FMCS)"
                  : String(
                      queryResult.scheme_recommendation?.scheme_name ||
                        "Scheme I (Product Certification / ISI Mark)",
                    )}
              </p>
              <Link
                href="/certification"
                className="mt-2 inline-block text-xs font-medium text-brand hover:underline"
              >
                View 5-Step Roadmap →
              </Link>
            </div>
          </div>

          {/* Full Grounded Assessment Narrative */}
          <article className="bis-panel bis-panel-pad">
            <h3 className="mb-3 text-base font-semibold text-ink">
              Applicability & Grounded Compliance Assessment
            </h3>
            <div className="text-sm leading-relaxed">
              <FormattedAnswer text={queryResult.answer} />
            </div>

            {queryResult.verification_reason && (
              <div className="mt-4 rounded-md border border-caution/30 bg-caution-soft p-3 text-xs text-caution">
                <strong>Unresolved Scope Boundary:</strong> {queryResult.verification_reason}
              </div>
            )}
          </article>

          {/* Actions & Next Steps */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
            <Link
              href={`/passport?product=${encodeURIComponent(productName)}&origin=${origin}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand/90"
            >
              Generate Compliance Passport <ArrowRight className="size-3.5" />
            </Link>

            <Link
              href="/laboratories"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
            >
              <Microscope className="size-3.5" /> Search Accredited Testing Labs
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

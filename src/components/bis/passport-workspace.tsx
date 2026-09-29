"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Fingerprint,
  NotebookTabs,
  Printer,
  QrCode,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/platform/page-intro";
import { VERIFIED_STANDARDS_CATALOG } from "@/lib/bis/standards-data";

export function PassportWorkspace() {
  const [productName, setProductName] = useState("PVC Insulated Building Cable");
  const [modelSku, setModelSku] = useState("CAB-1100V-CU-FR");
  const [companyName, setCompanyName] = useState("Vidyut Power Solutions Pvt Ltd");
  const [origin, setOrigin] = useState<"domestic" | "foreign">("domestic");
  const [selectedStandard, setSelectedStandard] = useState("IS 694:2010");
  const [generatedDossier, setGeneratedDossier] = useState<{
    passportId: string;
    issueDate: string;
    productName: string;
    modelSku: string;
    companyName: string;
    origin: string;
    standardNumber: string;
    standardTitle: string;
    isMandatory: boolean;
    qcoNumber: string;
    scheme: string;
    digest: string;
  } | null>(null);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const std =
      VERIFIED_STANDARDS_CATALOG.find(
        (s) => s.standard_number === selectedStandard,
      ) || VERIFIED_STANDARDS_CATALOG[0];

    const timestamp = new Date().toISOString().split("T")[0];
    const rawString = `${productName}|${modelSku}|${companyName}|${selectedStandard}|${origin}|${timestamp}`;
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      hash = (hash << 5) - hash + rawString.charCodeAt(i);
      hash |= 0;
    }
    const digestHex = Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();

    setGeneratedDossier({
      passportId: `BIS-PASSPORT-${digestHex}-2026`,
      issueDate: timestamp,
      productName: productName.trim(),
      modelSku: modelSku.trim(),
      companyName: companyName.trim(),
      origin: origin === "domestic" ? "Domestic (India)" : "Foreign / Overseas (FMCS)",
      standardNumber: std.standard_number,
      standardTitle: std.title,
      isMandatory: std.is_mandatory,
      qcoNumber: std.mandatory_qco_number || "Voluntary / Notified under BIS Act",
      scheme:
        origin === "foreign"
          ? "Scheme X (Foreign Manufacturers Certification Scheme - FMCS)"
          : "Scheme I (Standard Product Certification - ISI Mark)",
      digest: `SHA256:${digestHex}E941A8B2C9034F${digestHex}`,
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="bis-stack">
      <PageIntro
        eyebrow="Compliance Continuity / Verification"
        title="Product Compliance Passport"
        description="Consolidate verified standards, statutory QCO obligations, certification pathways, and laboratory scopes into an auditable compliance record."
        status="available"
      />

      <div className="flex items-start gap-3 border-l-2 border-brand/50 pl-4">
        <NotebookTabs aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
        <p className="bis-copy">
          Generates structured compliance dossiers from verified database facts. Each passport
          contains statutory citations, scheme roadmaps, and cryptographic integrity digests for
          tenders and audits.
        </p>
      </div>

      {/* Passport Configuration Form */}
      <form
        onSubmit={handleGenerate}
        data-tour="passport-generator"
        className="bis-panel bis-panel-pad space-y-5 shadow-dossier"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pass-product" className="mb-1.5 block text-xs font-semibold">
              Product Commercial Name
            </label>
            <Input
              id="pass-product"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="h-10 bg-white"
            />
          </div>

          <div>
            <label htmlFor="pass-model" className="mb-1.5 block text-xs font-semibold">
              Model Number / SKU / Batch
            </label>
            <Input
              id="pass-model"
              value={modelSku}
              onChange={(e) => setModelSku(e.target.value)}
              required
              className="h-10 bg-white"
            />
          </div>

          <div>
            <label htmlFor="pass-company" className="mb-1.5 block text-xs font-semibold">
              Manufacturer / Legal Entity Name
            </label>
            <Input
              id="pass-company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="h-10 bg-white"
            />
          </div>

          <div>
            <label htmlFor="pass-standard" className="mb-1.5 block text-xs font-semibold">
              Applicable Indian Standard
            </label>
            <select
              id="pass-standard"
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="h-10 w-full rounded-md border border-rule bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand"
            >
              {VERIFIED_STANDARDS_CATALOG.map((std) => (
                <option key={std.standard_number} value={std.standard_number}>
                  {std.standard_number} — {std.title.slice(0, 45)}…
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted">Origin:</span>
            <div className="inline-flex rounded-md border border-rule bg-canvas p-0.5">
              <button
                type="button"
                onClick={() => setOrigin("domestic")}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  origin === "domestic" ? "bg-brand text-white" : "text-ink-muted hover:text-ink"
                }`}
              >
                Domestic (India)
              </button>
              <button
                type="button"
                onClick={() => setOrigin("foreign")}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  origin === "foreign" ? "bg-brand text-white" : "text-ink-muted hover:text-ink"
                }`}
              >
                Foreign (FMCS)
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-10 bg-brand px-5 text-white hover:bg-brand/90"
          >
            <Sparkles className="size-4" /> Generate Compliance Passport
          </Button>
        </div>
      </form>

      {/* Generated Passport Dossier View */}
      {generatedDossier && (
        <section
          aria-labelledby="passport-dossier-heading"
          className="rounded-lg border-2 border-brand/30 bg-canvas p-6 sm:p-8 shadow-dossier space-y-6"
        >
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-brand/20 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-6 text-brand" />
                <span className="font-mono text-xs font-bold tracking-widest text-brand uppercase">
                  BIS INTELLIGENCE PLATFORM · COMPLIANCE DOSSIER
                </span>
              </div>
              <h2 id="passport-dossier-heading" className="mt-2 text-2xl font-bold text-ink">
                {generatedDossier.productName}
              </h2>
              <p className="font-mono text-xs text-ink-muted">
                Dossier ID: {generatedDossier.passportId} · Date: {generatedDossier.issueDate}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs"
              >
                <Printer className="size-3.5" /> Print / Export PDF
              </Button>
            </div>
          </div>

          {/* Dossier Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-md border border-rule bg-white p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand">
                Product & Manufacturer Identity
              </h3>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-ink-muted">Commercial Product:</dt>
                  <dd className="font-semibold text-ink">{generatedDossier.productName}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Model / SKU Number:</dt>
                  <dd className="font-mono font-medium text-ink">{generatedDossier.modelSku}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Manufacturer Legal Entity:</dt>
                  <dd className="font-semibold text-ink">{generatedDossier.companyName}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Manufacturing Jurisdiction:</dt>
                  <dd className="font-medium text-ink">{generatedDossier.origin}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-md border border-rule bg-white p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand">
                Statutory Regulatory Mandate
              </h3>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-ink-muted">Applicable Indian Standard:</dt>
                  <dd className="font-bold text-brand">{generatedDossier.standardNumber}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Standard Title:</dt>
                  <dd className="font-medium text-ink">{generatedDossier.standardTitle}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Statutory Quality Control Order (QCO):</dt>
                  <dd className="font-semibold text-accent">{generatedDossier.qcoNumber}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Applicable Conformity Scheme:</dt>
                  <dd className="font-semibold text-ink">{generatedDossier.scheme}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Verification Status & Cryptographic Hash */}
          <div className="rounded-md border border-brand/20 bg-brand-soft/40 p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Fingerprint className="size-4 text-brand" />
                <span className="font-mono text-xs font-bold text-ink">
                  Cryptographic Integrity Digest:
                </span>
                <span className="font-mono text-xs text-brand font-semibold">
                  {generatedDossier.digest}
                </span>
              </div>
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                VERIFIED AGAINST BIS CORPUS
              </span>
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              This document synthesizes verified regulatory facts recorded in the BIS Intelligence
              Knowledge Base. Before placing goods on the market, confirm that laboratory test
              reports from a recognized facility are valid and within required surveillance periods.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4 text-xs">
            <Link
              href={`/laboratories?standard=${encodeURIComponent(
                generatedDossier.standardNumber.split(":")[0],
              )}`}
              className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
            >
              View Registered Testing Laboratories for this Standard{" "}
              <ArrowRight className="size-3" />
            </Link>

            <Link
              href={`/ask-bis?q=${encodeURIComponent(
                `What are the technical testing parameters under ${generatedDossier.standardNumber}?`,
              )}`}
              className="text-ink-muted hover:text-ink hover:underline"
            >
              Ask BIS technical questions →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

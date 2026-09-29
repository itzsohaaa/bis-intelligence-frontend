"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Gem,
  HelpCircle,
  Loader2,
  Microscope,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/platform/page-intro";

const purityGrades = [
  {
    grade: "22K (916)",
    purity: "91.6% Pure Gold",
    carat: "22 Karat",
    marking: "22K916",
    commonUse: "Traditional wedding jewellery, bangles, necklaces",
  },
  {
    grade: "18K (750)",
    purity: "75.0% Pure Gold",
    carat: "18 Karat",
    marking: "18K750",
    commonUse: "Diamond-studded jewellery, rings, modern designer wear",
  },
  {
    grade: "14K (585)",
    purity: "58.5% Pure Gold",
    carat: "14 Karat",
    marking: "14K585",
    commonUse: "Lightweight jewellery, daily wear, international designs",
  },
  {
    grade: "9K (375)",
    purity: "37.5% Pure Gold",
    carat: "9 Karat",
    marking: "9K375",
    commonUse: "Budget fashion jewellery, high durability rings",
  },
];

interface HuidVerificationState {
  huid: string;
  verified: boolean;
  status: "VERIFIED" | "VERIFICATION_REQUIRED";
  message: string;
  standard?: string;
  scheme?: string;
  jeweller?: string;
  ahc?: string;
  date?: string;
  article?: string;
  purity?: string;
  official_portal_note?: string;
}

export function HallmarkingWorkspace() {
  const [huidInput, setHuidInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [huidResult, setHuidResult] = useState<HuidVerificationState | null>(null);

  async function handleVerifyHuid(e: React.FormEvent) {
    e.preventDefault();
    const clean = huidInput.trim().toUpperCase();

    // 1. Strict Format Validation (6 alphanumeric characters)
    if (!/^[A-Z0-9]{6}$/.test(clean)) {
      setValidationError("HUID must be exactly 6 alphanumeric characters (e.g. AB1234).");
      setHuidResult(null);
      return;
    }

    setValidationError(null);
    setIsVerifying(true);

    try {
      // 2. Query authoritative BFF endpoint
      const response = await fetch(`/api/bis/huid/${encodeURIComponent(clean)}`);
      if (!response.ok && response.status === 400) {
        setValidationError("Invalid HUID format. Expected 6 alphanumeric characters.");
        setIsVerifying(false);
        return;
      }

      const result: HuidVerificationState = await response.json();

      // 3. Strict record identity check: requested_huid == returned_record.huid
      if (result.huid && result.huid.toUpperCase() === clean) {
        setHuidResult(result);
      } else {
        // Fail-closed fallback
        setHuidResult({
          huid: clean,
          verified: false,
          status: "VERIFICATION_REQUIRED",
          message: "No verified record was found for this HUID in the available BIS evidence.",
          standard: "IS 1417:2016",
          scheme: "Scheme IV (Hallmarking of Precious Metals)",
        });
      }
    } catch {
      // Fail-closed on network error
      setHuidResult({
        huid: clean,
        verified: false,
        status: "VERIFICATION_REQUIRED",
        message: "No verified record was found for this HUID in the available BIS evidence.",
        standard: "IS 1417:2016",
        scheme: "Scheme IV (Hallmarking of Precious Metals)",
      });
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="bis-stack">
      <PageIntro
        eyebrow="Hallmarking / Precious Metals"
        title="Gold & Silver Hallmarking Intelligence"
        description="Statutory hallmarking framework under Indian Standard IS 1417:2016, gazetted Order S.O. 4345(E), and 6-digit HUID consumer verification."
        status="available"
      />

      <div className="flex items-start gap-3 border-l-2 border-brand/50 pl-4">
        <Gem aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
        <p className="bis-copy">
          Mandatory hallmarking of gold jewellery is in effect across 343+ notified districts in
          India under Gazette Order S.O. 4345(E) and Scheme IV. Sale of unhallmarked gold jewellery
          is legally prohibited.
        </p>
      </div>

      {/* The 3 Mandatory Hallmarking Signs */}
      <section aria-labelledby="hallmark-signs-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <h2 id="hallmark-signs-heading" className="text-base font-semibold text-ink">
            The 3 Mandatory Hallmarking Marks (Post July 2021)
          </h2>
          <span className="text-xs font-semibold text-accent">Statutory Requirement</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Sign 1: BIS Logo */}
          <div className="flex flex-col justify-between rounded-md border border-rule bg-canvas p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand">SIGN 01</span>
                <ShieldCheck className="size-5 text-brand" />
              </div>
              <h3 className="mt-2 text-base font-bold text-ink">BIS Standard Mark</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                The triangular Bureau of Indian Standards logo certifies that the article conforms
                to Indian Standard IS 1417:2016.
              </p>
            </div>
            <div className="mt-4 rounded bg-brand/5 p-2 text-center font-mono text-xs font-bold text-brand border border-brand/10">
              △ BIS TRIANGLE
            </div>
          </div>

          {/* Sign 2: Purity / Fineness */}
          <div className="flex flex-col justify-between rounded-md border border-rule bg-canvas p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand">SIGN 02</span>
                <Gem className="size-5 text-brand" />
              </div>
              <h3 className="mt-2 text-base font-bold text-ink">Purity / Fineness Grade</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Indicates the exact caratage and gold fineness (parts per thousand) assayed at the
                AHC.
              </p>
            </div>
            <div className="mt-4 rounded bg-brand/5 p-2 text-center font-mono text-xs font-bold text-brand border border-brand/10">
              22K916 · 18K750 · 14K585
            </div>
          </div>

          {/* Sign 3: 6-Digit HUID */}
          <div className="flex flex-col justify-between rounded-md border border-rule bg-canvas p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand">SIGN 03</span>
                <QrCode className="size-5 text-brand" />
              </div>
              <h3 className="mt-2 text-base font-bold text-ink">6-Digit Alphanumeric HUID</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Hallmark Unique Identification (e.g. <code>AB1234</code>). Laser-marked on each
                piece, ensuring traceability from manufacturer to consumer.
              </p>
            </div>
            <div className="mt-4 rounded bg-brand/5 p-2 text-center font-mono text-xs font-bold text-brand border border-brand/10">
              e.g. [A][B][1][2][3][4]
            </div>
          </div>
        </div>
      </section>

      {/* Purity & Fineness Reference Table */}
      <section
        aria-labelledby="purity-table-heading"
        className="bis-panel bis-panel-pad space-y-4 shadow-dossier"
        data-tour="purity-table"
      >
        <h2 id="purity-table-heading" className="text-base font-semibold text-ink">
          Recognized Gold Fineness Grades under IS 1417:2016
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-rule bg-canvas font-semibold text-ink">
              <tr>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Gold Fineness</th>
                <th className="py-2.5 px-3">Hallmark Stamp</th>
                <th className="py-2.5 px-3">Typical Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule text-ink">
              {purityGrades.map((p) => (
                <tr key={p.grade} className="hover:bg-brand-soft/20">
                  <td className="py-3 px-3 font-semibold text-brand">{p.grade}</td>
                  <td className="py-3 px-3 font-medium">{p.purity}</td>
                  <td className="py-3 px-3 font-mono font-bold">{p.marking}</td>
                  <td className="py-3 px-3 text-ink-muted">{p.commonUse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dynamic, Fail-Closed HUID Verifier */}
      <section
        aria-labelledby="huid-simulator-heading"
        className="bis-panel bis-panel-pad space-y-4"
        data-tour="huid-verification"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="size-5 text-brand" />
            <h2 id="huid-simulator-heading" className="text-base font-semibold text-ink">
              Dynamic HUID Verification System
            </h2>
          </div>
          <span className="text-xs text-ink-muted">Fail-Closed Verification Engine</span>
        </div>

        <p className="text-xs leading-relaxed text-ink-muted">
          Under Scheme IV, every hallmarked article contains a laser-etched 6-digit HUID code.
          Input your HUID to verify against available BIS evidence. The system enforces strict fail-closed
          validation: if an HUID record is not explicitly indexed in authoritative evidence, it returns{" "}
          <strong>Verification Required</strong> without fabricating jewellers or assay data.
        </p>

        <form onSubmit={handleVerifyHuid} className="flex flex-wrap gap-3 items-start">
          <div className="max-w-xs flex-1">
            <Input
              value={huidInput}
              onChange={(e) => {
                setHuidInput(e.target.value.toUpperCase());
                if (validationError) setValidationError(null);
              }}
              maxLength={6}
              placeholder="Enter 6-character HUID (e.g. AB1234)"
              className="h-11 font-mono uppercase bg-white text-base!"
              disabled={isVerifying}
            />
            {validationError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="size-3.5" />
                {validationError}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isVerifying || huidInput.trim().length === 0}
            className="h-11 bg-brand px-6 text-white hover:bg-brand/90 font-medium"
          >
            {isVerifying ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Querying Registry...
              </>
            ) : (
              "Verify HUID Record"
            )}
          </Button>
        </form>

        {/* Dynamic Verification Result */}
        {huidResult && (
          <div
            className={`rounded-lg border p-5 space-y-4 shadow-xs transition-colors ${
              huidResult.verified
                ? "border-emerald-300 bg-emerald-50/50"
                : "border-amber-300 bg-amber-50/60"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule/60 pb-3">
              <span className="font-mono text-base font-bold text-ink tracking-wider">
                HUID: {huidResult.huid}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  huidResult.verified
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}
              >
                {huidResult.verified ? (
                  <>
                    <CheckCircle2 className="size-3.5" /> Verified by AHC
                  </>
                ) : (
                  <>
                    <AlertTriangle className="size-3.5" /> Verification Required
                  </>
                )}
              </span>
            </div>

            <p className="text-sm font-semibold text-ink">
              {huidResult.message}
            </p>

            {huidResult.verified ? (
              <dl className="grid gap-3 text-xs sm:grid-cols-2 pt-1">
                <div>
                  <dt className="text-ink-muted">Registered Jeweller:</dt>
                  <dd className="font-semibold text-ink">{huidResult.jeweller}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Assaying & Hallmarking Centre:</dt>
                  <dd className="font-semibold text-ink">{huidResult.ahc}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Hallmarking Date:</dt>
                  <dd className="font-semibold text-ink">{huidResult.date}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Declared Article & Purity:</dt>
                  <dd className="font-semibold text-ink">
                    {huidResult.article} · {huidResult.purity}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="rounded-md border border-amber-200 bg-white/80 p-4 space-y-2.5 text-xs text-ink-muted leading-relaxed">
                <p className="font-medium text-amber-950">
                  Authoritative Hallmarking Guidance:
                </p>
                <p>
                  {huidResult.official_portal_note ||
                    "Under IS 1417:2016 and Gazette Order S.O. 4345(E), HUID records are centrally registered on the BIS Manakonline Hallmarking portal and BIS Care mobile application."}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <a
                    href="https://www.manakonline.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                  >
                    BIS Manakonline Hallmarking Portal <ExternalLink className="size-3" />
                  </a>
                  <span className="text-rule">|</span>
                  <Link
                    href={`/ask-bis?q=${encodeURIComponent(
                      "What are the hallmarking requirements for gold jewellery under IS 1417?",
                    )}`}
                    className="font-semibold text-brand hover:underline"
                  >
                    Ask BIS about IS 1417:2016 →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Query CTA */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4 text-xs"
        data-tour="live-hallmarking"
      >
        <div className="flex items-center gap-2 text-ink-muted">
          <Microscope className="size-4 text-brand" />
          <span>Testing per IS 1417 fire assay / cupellation at BIS Central Laboratory</span>
        </div>
        <Link
          href={`/ask-bis?q=${encodeURIComponent(
            "What are the hallmarking requirements for gold jewellery under IS 1417?",
          )}`}
          className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
        >
          Ask BIS Live Hallmarking Questions <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

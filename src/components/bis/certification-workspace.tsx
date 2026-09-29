"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Factory,
  FileSpreadsheet,
  Globe2,
  HelpCircle,
  Microscope,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageIntro } from "@/components/platform/page-intro";

const schemes = [
  {
    id: "scheme-1",
    code: "Scheme I",
    title: "Product Certification Scheme (ISI Mark)",
    tag: "Domestic Manufacturing",
    authority: "BIS Act 2016, Bureau of Indian Standards",
    summary:
      "The flagship BIS conformity assessment scheme for domestic manufacturing. Requires complete in-house testing equipment, factory audit, independent laboratory verification, and grants the right to use the Standard ISI Mark.",
    prerequisites: [
      "Manufacturing premises in India with verified manufacturing machinery",
      "In-house testing laboratory with calibrated test instruments per relevant IS",
      "Competent quality control personnel appointed",
      "Agreement to the Scheme of Inspection and Testing (SIT)",
    ],
    steps: [
      {
        number: "01",
        title: "Application & Documentation Filing",
        desc: "Submit Form V on the Manakonline portal along with factory layout, manufacturing machinery list, test equipment calibration certificates, and application fees.",
      },
      {
        number: "02",
        title: "Preliminary Factory Audit",
        desc: "A BIS Inspecting Officer visits the manufacturing premises to verify manufacturing capacity, testing infrastructure, and witness in-house testing of products.",
      },
      {
        number: "03",
        title: "Sample Drawing & Independent Testing",
        desc: "Samples drawn during the inspection are sealed and dispatched to a BIS-recognized or NABL-accredited laboratory for complete conformity testing against the Indian Standard.",
      },
      {
        number: "04",
        title: "Grant of Licence (CML)",
        desc: "Upon successful test report evaluation and fee clearance, BIS issues the Certificate of Manufacturing Licence (CML Number) authorizing the application of the ISI mark.",
      },
      {
        number: "05",
        title: "Surveillance & Market Sampling",
        desc: "BIS conducts unannounced periodic factory surveillance and random market sample drawing to ensure continuous conformity throughout the licence period.",
      },
    ],
  },
  {
    id: "scheme-2",
    code: "Scheme II",
    title: "Compulsory Registration Scheme (CRS)",
    tag: "Electronics & IT Goods",
    authority: "MeitY / BIS CRO Orders",
    summary:
      "A fast-track conformity scheme for electronic and IT products. Testing is conducted at BIS-approved laboratories, followed by self-declaration of conformity and registration grant without prior factory inspection.",
    prerequisites: [
      "Test report from a BIS-approved laboratory in India within 90 days of issuance",
      "Brand owner authorization and undertaking",
      "Authorized Indian Representative (AIR) for foreign entities",
    ],
    steps: [
      {
        number: "01",
        title: "Sample Testing at BIS Recognized Lab",
        desc: "Submit product samples directly to a BIS-recognized testing laboratory in India for testing against applicable safety standards (e.g. IS 15885, IS 13252).",
      },
      {
        number: "02",
        title: "Online Registration Application",
        desc: "Upload the valid test report (less than 90 days old) and manufacturer declarations on the BIS CRS portal.",
      },
      {
        number: "03",
        title: "Document & Test Report Scrutiny",
        desc: "BIS scrutiny officers evaluate the laboratory report, critical component list (CCL), and labelling proofs.",
      },
      {
        number: "04",
        title: "Grant of Registration (R-Number)",
        desc: "BIS grants an 8-digit unique Registration Number (e.g. R-XXXXXXXX) authorizing the standard CRS mark.",
      },
      {
        number: "05",
        title: "Market Surveillance",
        desc: "Products in the Indian market are subject to surveillance sample collection and testing under MeitY guidelines.",
      },
    ],
  },
  {
    id: "scheme-4",
    code: "Scheme IV",
    title: "Hallmarking Scheme (Precious Metals)",
    tag: "Jewellery & Artefacts",
    authority: "IS 1417 / BIS Hallmarking Regulations",
    summary:
      "Mandatory quality certification for gold and silver jewellery and artefacts. Involves jeweller registration and laser-marking of 6-digit Hallmark Unique Identification (HUID) numbers at Assaying & Hallmarking Centres (AHCs).",
    prerequisites: [
      "Registered retail or manufacturing jeweller premises",
      "Valid GST registration and trade licence",
      "Tie-up with an authorized Assaying and Hallmarking Centre (AHC)",
    ],
    steps: [
      {
        number: "01",
        title: "Jeweller Portal Registration",
        desc: "Register online on the BIS Manakonline Hallmarking portal (one-time registration with zero government fees for micro-enterprises).",
      },
      {
        number: "02",
        title: "Consignment Handover to AHC",
        desc: "Dispatch jewellery lots to a BIS-recognized Assaying and Hallmarking Centre (AHC) with declaration of declared purity.",
      },
      {
        number: "03",
        title: "Assaying & Fire Assay Testing",
        desc: "AHC conducts XRF screening and cupellation (fire assay) per IS 1417 to verify precious metal fineness.",
      },
      {
        number: "04",
        title: "HUID Generation & Laser Marking",
        desc: "Upon passing assay, a unique 6-digit alphanumeric HUID is generated on the BIS server and laser-etched onto each article alongside the BIS logo and purity grade.",
      },
      {
        number: "05",
        title: "Consumer Verification on BIS Care App",
        desc: "Each hallmarked piece can be verified in real time by end consumers using the BIS Care mobile application.",
      },
    ],
  },
  {
    id: "scheme-10",
    code: "Scheme X",
    title: "Foreign Manufacturers Certification Scheme (FMCS)",
    tag: "Overseas Factories",
    authority: "BIS Act 2016, Foreign Manufacturers Regulations",
    summary:
      "Enables foreign manufacturers located outside India to apply the ISI mark on goods exported to the Indian market. Requires nomination of an Authorized Indian Representative (AIR) and overseas factory inspection.",
    prerequisites: [
      "Manufacturing plant located outside India with complete manufacturing facilities",
      "Appointed Authorized Indian Representative (AIR) residing in India",
      "Performance bank guarantee submitted to BIS",
    ],
    steps: [
      {
        number: "01",
        title: "Application & AIR Appointment",
        desc: "Foreign manufacturer submits application Form VI nominating an Authorized Indian Representative (AIR) who accepts legal responsibility in India.",
      },
      {
        number: "02",
        title: "Overseas Factory Audit",
        desc: "BIS technical auditing team travels to the overseas factory premises to inspect production equipment, QC protocols, and witness testing.",
      },
      {
        number: "03",
        title: "Independent Lab Testing in India",
        desc: "Samples drawn at the overseas factory are flown to India and tested at a BIS-designated accredited laboratory.",
      },
      {
        number: "04",
        title: "Performance Bank Guarantee & Licence",
        desc: "Manufacturer furnishes USD performance bank guarantee and pays marking fees, followed by grant of CML licence.",
      },
      {
        number: "05",
        title: "Consignment Inspection at Port",
        desc: "Indian customs and BIS verify shipments arriving at Indian ports against the valid FMCS licence.",
      },
    ],
  },
];

export function CertificationWorkspace() {
  const [selectedSchemeId, setSelectedSchemeId] = useState("scheme-1");
  const activeScheme =
    schemes.find((s) => s.id === selectedSchemeId) || schemes[0];

  return (
    <div className="bis-stack">
      <PageIntro
        eyebrow="Certification / Regulatory Roadmaps"
        title="Certification Pathways"
        description="Understand the 4 authoritative BIS Conformity Assessment schemes and their end-to-end 5-step preparation roadmaps."
        status="available"
      />

      <div className="flex items-start gap-3 border-l-2 border-brand/50 pl-4">
        <ClipboardCheck aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
        <p className="bis-copy">
          Evidence-grounded roadmap for Scheme I (ISI Mark), Scheme II (CRS), Scheme IV
          (Hallmarking), and Scheme X (FMCS). Every step reflects official BIS statutory
          regulations and audit requirements.
        </p>
      </div>

      {/* Scheme Selector Tabs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {schemes.map((scheme) => (
          <button
            key={scheme.id}
            type="button"
            onClick={() => setSelectedSchemeId(scheme.id)}
            className={`flex flex-col justify-between rounded-md border p-4 text-left transition-all ${
              selectedSchemeId === scheme.id
                ? "border-brand bg-brand text-white shadow-sm ring-2 ring-brand/20"
                : "border-rule bg-canvas text-ink hover:border-brand/40"
            }`}
          >
            <div>
              <span
                className={`font-mono text-xs font-bold uppercase tracking-wider ${
                  selectedSchemeId === scheme.id ? "text-white/80" : "text-brand"
                }`}
              >
                {scheme.code}
              </span>
              <h3 className="mt-1 text-sm font-semibold leading-tight">{scheme.title}</h3>
            </div>
            <span
              className={`mt-4 inline-block self-start rounded px-2 py-0.5 text-[11px] font-medium ${
                selectedSchemeId === scheme.id
                  ? "bg-white/20 text-white"
                  : "bg-brand/10 text-brand"
              }`}
            >
              {scheme.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Active Scheme Overview */}
      <section
        aria-labelledby="scheme-overview-heading"
        className="bis-panel bis-panel-pad space-y-6 shadow-dossier"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase text-brand">
              {activeScheme.code} · {activeScheme.tag}
            </span>
            <h2 id="scheme-overview-heading" className="text-xl font-bold text-ink">
              {activeScheme.title}
            </h2>
            <p className="mt-1 text-xs text-ink-muted">Authority: {activeScheme.authority}</p>
          </div>
          <a
            href="https://www.manakonline.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-white px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-soft"
          >
            Manakonline Portal <ExternalLink className="size-3" />
          </a>
        </div>

        <p className="text-sm leading-relaxed text-ink">{activeScheme.summary}</p>

        {/* Prerequisites */}
        <div className="rounded-md border border-rule bg-brand-soft/30 p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand">
            Mandatory Prerequisites Before Application
          </h3>
          <ul className="space-y-1.5 text-xs text-ink">
            {activeScheme.prerequisites.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5-Step Roadmap */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-ink">
            Authoritative 5-Step Process Roadmap
          </h3>
          <ol className="bis-workflow bis-stagger">
            {activeScheme.steps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="pt-0.5 font-sans font-bold tabular-nums text-xs text-brand">
                  {step.number}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-ink">{step.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4 text-xs">
          <div className="flex items-center gap-2 text-ink-muted">
            <ShieldCheck className="size-4 text-brand" />
            <span>Regulated under Bureau of Indian Standards (Conformity Assessment) Regulations</span>
          </div>

          <Link
            href="/product-intelligence"
            className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
          >
            Evaluate Your Product Against This Scheme <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}

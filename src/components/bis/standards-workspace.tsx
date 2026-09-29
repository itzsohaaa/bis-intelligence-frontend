"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ExternalLink,
  Filter,
  Microscope,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/platform/page-intro";
import type { StandardCatalogRecord } from "@/lib/bis/types";

export function StandardsWorkspace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mandatoryOnly, setMandatoryOnly] = useState(false);
  const [standards, setStandards] = useState<StandardCatalogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandards() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category !== "all") params.set("category", category);
        if (mandatoryOnly) params.set("mandatory", "true");

        const res = await fetch(`/api/bis/standards?${params.toString()}`);
        if (res.ok) {
          const data = (await res.json()) as {
            total: number;
            standards: StandardCatalogRecord[];
          };
          setStandards(data.standards);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(() => {
      void fetchStandards();
    }, 150);
    return () => clearTimeout(timer);
  }, [query, category, mandatoryOnly]);

  const categories = [
    "all",
    "Electrical",
    "Precious Metals",
    "Steel",
    "Medical",
    "Consumer",
    "Construction",
    "Plastics",
  ];

  return (
    <div className="bis-stack">
      <PageIntro
        eyebrow="Standards / Catalog & Scope"
        title="Indian Standards Catalog"
        description="Search across 25 verified Indian Standards, gazetted Quality Control Orders (QCOs), and applicable product categories."
        status="available"
      />

      <div className="flex items-start gap-3 border-l-2 border-brand/50 pl-4">
        <BookOpen aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
        <p className="bis-copy">
          Authoritative records derived directly from the BIS Knowledge Model database. Every standard
          includes gazetted QCO references, technical committees, and applicability scope.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div data-tour="standards-search" className="bis-panel bis-panel-pad space-y-4 shadow-dossier">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] flex-1">
            <Search className="absolute top-3 left-3 size-4 text-ink-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by IS number (e.g. IS 1293), product name, or keyword…"
              className="pl-9 h-11 bg-white text-base!"
            />
          </div>
          <button
            type="button"
            onClick={() => setMandatoryOnly(!mandatoryOnly)}
            className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-xs font-semibold transition-colors ${
              mandatoryOnly
                ? "border-accent bg-accent text-white"
                : "border-rule bg-canvas text-ink hover:border-brand/40"
            }`}
          >
            <ShieldAlert className="size-3.5" />
            Mandatory QCO Only
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-rule pt-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-ink-muted">
            <Filter className="size-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1 font-medium capitalize transition-colors ${
                category === cat
                  ? "bg-brand text-white"
                  : "bg-brand/5 text-ink hover:bg-brand/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Standards List */}
      <section aria-labelledby="standards-list-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <h2 id="standards-list-heading" className="text-base font-semibold text-ink">
            Standards Matching Search ({standards.length})
          </h2>
          <span className="text-xs text-ink-muted">
            {standards.filter((s) => s.is_mandatory).length} under Mandatory QCO
          </span>
        </div>

        {loading ? (
          <div className="rounded-md border border-rule bg-canvas p-8 text-center text-sm text-ink-muted">
            Loading standards…
          </div>
        ) : standards.length === 0 ? (
          <div className="rounded-md border border-rule bg-canvas p-8 text-center">
            <p className="text-base font-semibold text-ink">No matching Indian Standards found</p>
            <p className="mt-2 text-sm text-ink-muted">
              Try adjusting your search terms or uncheck the mandatory-only filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {standards.map((std) => (
              <article
                key={std.standard_number}
                className="flex flex-col justify-between rounded-md border border-rule bg-canvas p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-sans font-bold text-base text-brand">
                        {std.standard_number}
                      </span>
                      {std.edition_or_version && (
                        <span className="ml-2 rounded bg-ink/5 px-2 py-0.5 text-xs text-ink-muted">
                          {std.edition_or_version}
                        </span>
                      )}
                    </div>
                    {std.is_mandatory ? (
                      <span className="inline-flex items-center gap-1 rounded bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent border border-accent/20">
                        <ShieldAlert className="size-3" />
                        Mandatory
                      </span>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Voluntary
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-semibold text-ink leading-snug">
                    {std.title}
                  </h3>

                  <div className="mt-3 space-y-1 text-xs text-ink-muted">
                    <p>
                      <strong className="font-medium text-ink">Category:</strong> {std.category}
                    </p>
                    {std.technical_committee && (
                      <p>
                        <strong className="font-medium text-ink">Committee:</strong>{" "}
                        {std.technical_committee}
                      </p>
                    )}
                    {std.mandatory_qco_number && (
                      <p className="text-accent font-medium">
                        <strong>QCO:</strong> {std.mandatory_qco_number}
                      </p>
                    )}
                  </div>

                  {std.applicable_products.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-medium text-ink-muted">Products in Scope:</p>
                      <div className="flex flex-wrap gap-1">
                        {std.applicable_products.map((prod) => (
                          <span
                            key={prod}
                            className="rounded bg-brand/5 px-2 py-0.5 text-xs font-medium text-brand"
                          >
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 text-xs">
                  <Link
                    href={`/ask-bis?q=${encodeURIComponent(
                      `What are the requirements under ${std.standard_number}?`,
                    )}`}
                    className="flex items-center gap-1 font-semibold text-brand hover:underline"
                  >
                    Query in Ask BIS <ArrowRight className="size-3" />
                  </Link>

                  <Link
                    href={`/laboratories?standard=${encodeURIComponent(
                      std.standard_number.split(":")[0],
                    )}`}
                    className="flex items-center gap-1 text-ink-muted hover:text-ink"
                  >
                    <Microscope className="size-3.5 text-brand" /> Testing Labs
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

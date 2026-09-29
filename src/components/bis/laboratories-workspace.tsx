"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  MapPin,
  MapPinOff,
  Microscope,
  Navigation,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageIntro } from "@/components/platform/page-intro";
import type { LaboratoryRecord, LaboratoriesResponse } from "@/lib/bis/types";

const popularStandards = [
  { standard: "IS 1293", label: "IS 1293 (Plugs & Sockets)" },
  { standard: "IS 694", label: "IS 694 (PVC Cables)" },
  { standard: "IS 9873", label: "IS 9873 (Toy Safety)" },
  { standard: "IS 3055", label: "IS 3055 (Thermometers)" },
  { standard: "IS 1417", label: "IS 1417 (Gold Hallmarking)" },
  { standard: "IS 1786", label: "IS 1786 (Steel Rebars)" },
];

export function LaboratoriesWorkspace() {
  const searchParams = useSearchParams();
  const initialStandard = searchParams.get("standard") || "IS 1293";
  const [standardInput, setStandardInput] = useState(initialStandard);
  const [activeStandard, setActiveStandard] = useState(initialStandard);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LaboratoriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchLabs(standard: string) {
    const std = standard.trim();
    if (!std) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bis/laboratories/${encodeURIComponent(std)}`);
      if (!res.ok) {
        throw new Error(`Failed to retrieve laboratory records (HTTP ${res.status})`);
      }
      const data = (await res.json()) as LaboratoriesResponse;
      setResult(data);
      setActiveStandard(std);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve testing laboratories. Please verify your connection.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialStandard) {
      void fetchLabs(initialStandard);
    }
  }, [initialStandard]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void fetchLabs(standardInput);
  }

  return (
    <div className="bis-stack">
      <PageIntro
        eyebrow="Testing / Accredited Facilities"
        title="Testing Laboratories"
        description="Discover NABL-accredited and BIS-recognized laboratories authorized for specific Indian Standards."
        status="available"
      />

      <div className="flex items-start gap-3 border-l-2 border-brand/50 pl-4">
        <Microscope aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
        <p className="bis-copy">
          Real database records from the verified BIS Laboratory Network and NABL registry.
          Zero invented facilities or synthetic accreditation claims.
        </p>
      </div>

      {/* Search Bar & Quick Filters */}
      <form
        onSubmit={onSubmit}
        className="bis-panel bis-panel-pad space-y-4 shadow-dossier"
      >
        <div>
          <label htmlFor="standard-input" className="mb-2 block text-sm font-semibold">
            Indian Standard Number (e.g. IS 1293, IS 694, IS 1417)
          </label>
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute top-3 left-3 size-4 text-ink-muted" />
              <Input
                id="standard-input"
                value={standardInput}
                onChange={(e) => setStandardInput(e.target.value)}
                placeholder="Enter standard number (e.g. IS 1293)"
                className="pl-9 h-11 bg-white text-base!"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !standardInput.trim()}
              className="h-11 bg-brand px-6 text-white hover:bg-brand/90"
            >
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {loading ? "Searching..." : "Find Laboratories"}
            </Button>
          </div>
        </div>

        <div className="border-t border-rule pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Frequently Queried Standards
          </p>
          <div className="flex flex-wrap gap-2">
            {popularStandards.map((item) => (
              <button
                key={item.standard}
                type="button"
                onClick={() => {
                  setStandardInput(item.standard);
                  void fetchLabs(item.standard);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeStandard.toLowerCase() === item.standard.toLowerCase()
                    ? "border-brand bg-brand text-white"
                    : "border-rule bg-canvas text-ink hover:border-brand/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Error View */}
      {error && (
        <Alert className="border-caution/25 bg-caution-soft p-5 text-caution">
          <AlertCircle className="size-4" />
          <AlertTitle>Laboratory Query Unavailable</AlertTitle>
          <AlertDescription className="text-ink-muted">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results View */}
      {result && (
        <section aria-labelledby="lab-results-heading" className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-3">
            <div>
              <h2 id="lab-results-heading" className="text-lg font-semibold text-ink">
                Accredited Testing Scope for {result.standard_number}
              </h2>
              <p className="text-xs text-ink-muted">
                {result.total_laboratories} facility
                {result.total_laboratories === 1 ? "" : "s"} verified in local corpus
              </p>
            </div>
            <a
              href="https://www.manakonline.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              Verify on Official Manakonline Portal <ExternalLink className="size-3" />
            </a>
          </div>

          {result.total_laboratories === 0 ? (
            <div className="rounded-md border border-rule bg-canvas p-8 text-center">
              <Building2 className="mx-auto mb-3 size-8 text-ink-muted" />
              <h3 className="text-base font-semibold text-ink">
                No Registered Laboratories in Verified Corpus for {result.standard_number}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                Testing requirements for this standard may be conducted at manufacturer
                in-house laboratories or verified testing facilities listed directly on the
                National NABL / BIS portal.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {result.laboratories.map((lab) => (
                <article
                  key={lab.lab_id}
                  data-testid="lab-card"
                  className="flex flex-col justify-between rounded-md border border-rule bg-canvas p-5 shadow-xs transition-shadow hover:shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-ink" data-testid="lab-name">{lab.name}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                          <MapPin className="size-3.5 shrink-0 text-brand" />
                          <span>
                            {lab.city}, {lab.state}
                          </span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 border border-green-200/60">
                        <CheckCircle2 className="size-3" />
                        Accredited
                      </span>
                    </div>

                    {/* Exact Verified Location Section */}
                    <div className="rounded border border-rule/70 bg-white/70 p-3 text-xs">
                      <p className="font-semibold text-ink flex items-center gap-1.5">
                        <Navigation className="size-3.5 text-brand" />
                        Exact Verified Facility Address:
                      </p>
                      {lab.address ? (
                        <p className="mt-1.5 text-ink leading-relaxed" data-testid="lab-address">
                          {lab.address}
                        </p>
                      ) : (
                        <p className="mt-1.5 italic text-ink-muted" data-testid="lab-address-unverified">
                          Exact street address not yet verified in official registry.
                        </p>
                      )}

                      {lab.address_source_title && (
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 border-t border-rule/50 pt-2 text-[11px] text-ink-muted">
                          <span>
                            Source:{" "}
                            {lab.address_source_url ? (
                              <a
                                href={lab.address_source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand hover:underline"
                              >
                                {lab.address_source_title}
                              </a>
                            ) : (
                              lab.address_source_title
                            )}
                          </span>
                          {lab.address_verified_at && (
                            <span>
                              Verified: {new Date(lab.address_verified_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Google Maps Action */}
                    <div>
                      {lab.google_maps_url ? (
                        <a
                          href={lab.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="lab-map-link"
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-brand bg-brand/5 px-3 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                        >
                          <MapPin className="size-3.5" />
                          Open in Google Maps
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span
                          data-testid="lab-location-unverified"
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-rule bg-canvas-subtle px-3 py-2 text-xs font-medium text-ink-muted"
                        >
                          <MapPinOff className="size-3.5" />
                          Location not verified
                        </span>
                      )}
                    </div>

                    <div className="border-t border-rule pt-3">
                      <p className="text-xs text-ink-muted">NABL Accreditation No:</p>
                      <p className="font-mono text-sm font-semibold text-ink">
                        {lab.accreditation_number}
                      </p>
                    </div>

                    {lab.scope_of_testing.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-ink-muted">
                          Authorized Testing Scope:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {lab.scope_of_testing.map((scope) => (
                            <span
                              key={scope}
                              className="rounded bg-brand/5 px-2 py-0.5 text-xs font-medium text-brand border border-brand/10"
                            >
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-rule pt-3 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-brand" />
                      BIS Recognized
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">
                      ID: {lab.lab_id}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

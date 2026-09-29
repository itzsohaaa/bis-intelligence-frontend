import "server-only";
import { queryErrors, type QueryErrorCode } from "@/lib/bis/errors";
import type { LaboratoryRecord, LaboratoriesResponse } from "@/lib/bis/types";
import { enrichLaboratoryLocation } from "@/lib/bis/location";

export const runtime = "nodejs";

function failure(code: QueryErrorCode, status: number) {
  return Response.json(
    { error: { code, message: queryErrors[code] } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(
  request: Request,
  props: { params: Promise<{ standard: string }> },
) {
  const params = await props.params;
  const standardNumber = decodeURIComponent(params.standard || "").trim();
  if (!standardNumber || standardNumber.length > 50) {
    return failure("INVALID_REQUEST", 400);
  }

  const serviceUrl = process.env.BIS_SERVICE_URL?.trim();
  const serviceKey = process.env.BIS_SERVICE_KEY?.trim();
  if (!serviceUrl || !serviceKey) return failure("NOT_CONFIGURED", 503);

  let endpoint: URL;
  try {
    endpoint = new URL(serviceUrl);
    const isLocal =
      endpoint.hostname === "localhost" || endpoint.hostname === "127.0.0.1";
    const isAllowedProto =
      endpoint.protocol === "https:" || (endpoint.protocol === "http:" && isLocal);
    if (
      !isAllowedProto ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash
    ) {
      return failure("NOT_CONFIGURED", 503);
    }
    endpoint = new URL(
      `/query/laboratories/${encodeURIComponent(standardNumber)}`,
      endpoint,
    );
  } catch {
    return failure("NOT_CONFIGURED", 503);
  }

  const timeout = AbortSignal.timeout(30_000);
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.any([timeout, request.signal]),
      headers: {
        Accept: "application/json",
        "X-Internal-Service-Key": serviceKey,
      },
    });

    if (!response.ok) {
      const status = response.status >= 400 ? response.status : 502;
      const code =
        status === 401 || status === 403
          ? "UPSTREAM_AUTH"
          : status === 400 || status === 422
            ? "UPSTREAM_VALIDATION"
            : status === 429
              ? "RATE_LIMITED"
              : "UPSTREAM_ERROR";
      return failure(code, status);
    }

    const payload = (await response.json()) as {
      standard_number?: string;
      laboratories?: LaboratoryRecord[];
      total_laboratories?: number;
    };

    const result: LaboratoriesResponse = {
      standard_number: standardNumber,
      laboratories: Array.isArray(payload.laboratories)
        ? payload.laboratories.map((lab) =>
            enrichLaboratoryLocation({
              lab_id: String(lab.lab_id || ""),
              name: String(lab.name || "Unnamed Laboratory"),
              city: String(lab.city || ""),
              state: String(lab.state || ""),
              accreditation_number: String(lab.accreditation_number || "Unregistered"),
              scope_of_testing: Array.isArray(lab.scope_of_testing)
                ? lab.scope_of_testing.map(String)
                : [],
              created_at: typeof lab.created_at === "number" ? lab.created_at : undefined,
              address: lab.address ? String(lab.address) : null,
              address_source_url: lab.address_source_url ? String(lab.address_source_url) : null,
              address_source_title: lab.address_source_title ? String(lab.address_source_title) : null,
              address_verified_at: lab.address_verified_at ? String(lab.address_verified_at) : null,
              latitude: typeof lab.latitude === "number" ? lab.latitude : null,
              longitude: typeof lab.longitude === "number" ? lab.longitude : null,
              google_place_id: lab.google_place_id ? String(lab.google_place_id) : null,
              google_maps_url: lab.google_maps_url ? String(lab.google_maps_url) : null,
            }),
          )
        : [],
      total_laboratories:
        typeof payload.total_laboratories === "number"
          ? payload.total_laboratories
          : Array.isArray(payload.laboratories)
            ? payload.laboratories.length
            : 0,
    };

    return Response.json(result, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  } catch {
    return failure(
      timeout.aborted ? "TIMEOUT" : "UNREACHABLE",
      timeout.aborted ? 504 : 502,
    );
  }
}

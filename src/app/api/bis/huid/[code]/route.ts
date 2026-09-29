import "server-only";
import { queryErrors, type QueryErrorCode } from "@/lib/bis/errors";

export const runtime = "nodejs";

function failure(code: QueryErrorCode, status: number) {
  return Response.json(
    { error: { code, message: queryErrors[code] } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

const HUID_REGEX = /^[A-Z0-9]{6}$/;

export interface HuidVerificationResult {
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

export async function GET(
  request: Request,
  props: { params: Promise<{ code: string }> },
) {
  const params = await props.params;
  const rawCode = decodeURIComponent(params.code || "").trim().toUpperCase();

  // 1. Strict Format Validation (6 alphanumeric characters)
  if (!HUID_REGEX.test(rawCode)) {
    return failure("INVALID_REQUEST", 400);
  }

  const serviceUrl = process.env.BIS_SERVICE_URL?.trim();
  const serviceKey = process.env.BIS_SERVICE_KEY?.trim();

  // Fail-closed fallback payload when backend is not configured or offline
  const failClosedRecord: HuidVerificationResult = {
    huid: rawCode,
    verified: false,
    status: "VERIFICATION_REQUIRED",
    message: "No verified record was found for this HUID in the available BIS evidence.",
    standard: "IS 1417:2016",
    scheme: "Scheme IV (Hallmarking of Precious Metals)",
    official_portal_note:
      "Under IS 1417:2016 and Gazette Order S.O. 4345(E), HUID records are centrally registered on the BIS Manakonline Hallmarking portal and BIS Care mobile application. Live physical jewellery can be verified using the official BIS Care App or at an accredited Assaying and Hallmarking Centre (AHC).",
  };

  if (!serviceUrl || !serviceKey) {
    return Response.json(failClosedRecord, {
      headers: { "Cache-Control": "no-store" },
    });
  }

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
      return Response.json(failClosedRecord, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    endpoint = new URL(`/query/huid/${encodeURIComponent(rawCode)}`, endpoint);
  } catch {
    return Response.json(failClosedRecord, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const timeout = AbortSignal.timeout(15_000);
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
      // Fail-closed on any upstream error or 404
      return Response.json(failClosedRecord, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const payload = (await response.json()) as Partial<HuidVerificationResult>;

    // Strict identity check: requested_huid == returned_record.huid
    if (!payload.huid || payload.huid.toUpperCase() !== rawCode) {
      return Response.json(failClosedRecord, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    // Only return verified fields if explicitly backed by evidence
    const result: HuidVerificationResult = {
      huid: rawCode,
      verified: payload.verified === true,
      status: payload.verified === true ? "VERIFIED" : "VERIFICATION_REQUIRED",
      message:
        payload.verified === true
          ? String(payload.message || "HUID verified in official BIS registry.")
          : "No verified record was found for this HUID in the available BIS evidence.",
      standard: payload.standard ? String(payload.standard) : "IS 1417:2016",
      scheme: payload.scheme ? String(payload.scheme) : "Scheme IV",
      jeweller: payload.verified === true && payload.jeweller ? String(payload.jeweller) : undefined,
      ahc: payload.verified === true && payload.ahc ? String(payload.ahc) : undefined,
      date: payload.verified === true && payload.date ? String(payload.date) : undefined,
      article: payload.verified === true && payload.article ? String(payload.article) : undefined,
      purity: payload.verified === true && payload.purity ? String(payload.purity) : undefined,
      official_portal_note: payload.official_portal_note
        ? String(payload.official_portal_note)
        : failClosedRecord.official_portal_note,
    };

    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Fail-closed on timeout or connection failure
    return Response.json(failClosedRecord, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

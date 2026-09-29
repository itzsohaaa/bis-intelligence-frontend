import "server-only";
import { normalizeQueryResponse, validateQuery } from "@/lib/bis/normalize";
import { queryErrors, type QueryErrorCode } from "@/lib/bis/errors";

export const runtime = "nodejs";

function redact(value: unknown, secret: string): unknown {
  if (typeof value === "string") return value.split(secret).join("[redacted]");
  if (Array.isArray(value)) return value.map((item) => redact(item, secret));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key.split(secret).join("[redacted]"), redact(item, secret)]));
  }
  return value;
}

function failure(code: QueryErrorCode, status: number) {
  return Response.json({ error: { code, message: queryErrors[code] } }, {
    status, headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return failure("INVALID_REQUEST", 400); }
  const input = validateQuery(body);
  if (!input) return failure("INVALID_REQUEST", 400);

  // This module is server-only. Never forward browser headers or return upstream errors verbatim.
  const serviceUrl = process.env.BIS_SERVICE_URL?.trim();
  const serviceKey = process.env.BIS_SERVICE_KEY?.trim();
  if (!serviceUrl || !serviceKey) return failure("NOT_CONFIGURED", 503);
  let endpoint: URL;
  try {
    endpoint = new URL(serviceUrl);
    const isLocal = endpoint.hostname === "localhost" || endpoint.hostname === "127.0.0.1";
    const isAllowedProto = endpoint.protocol === "https:" || (endpoint.protocol === "http:" && isLocal);
    if (!isAllowedProto || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
      return failure("NOT_CONFIGURED", 503);
    }
    endpoint = new URL("/query", endpoint);
  } catch { return failure("NOT_CONFIGURED", 503); }

  const timeout = AbortSignal.timeout(90_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST", cache: "no-store", redirect: "error",
      signal: AbortSignal.any([timeout, request.signal]),
      headers: { "Content-Type": "application/json", "X-Internal-Service-Key": serviceKey },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const status = response.status >= 400 ? response.status : 502;
      const code = status === 401 || status === 403 ? "UPSTREAM_AUTH"
        : status === 400 || status === 422 ? "UPSTREAM_VALIDATION"
        : status === 429 ? "RATE_LIMITED" : "UPSTREAM_ERROR";
      return failure(code, status);
    }
    let payload: unknown;
    try {
      // Defense in depth against an upstream response reflecting the credential.
      const raw = await response.text();
      payload = redact(JSON.parse(raw), serviceKey);
    } catch {
      return failure(timeout.aborted ? "TIMEOUT" : "INVALID_RESPONSE", timeout.aborted ? 504 : 502);
    }
    const normalized = normalizeQueryResponse(payload);
    if (!normalized) return failure("INVALID_RESPONSE", 502);
    return Response.json(normalized, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return failure(timeout.aborted ? "TIMEOUT" : "UNREACHABLE", timeout.aborted ? 504 : 502);
  }
}

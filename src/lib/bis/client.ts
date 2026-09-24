import { errorMessage, queryErrors } from "./errors";
import { isRecord, normalizeQueryResponse } from "./normalize";
import type { QueryRequest, QuerySuccess } from "./types";

export async function queryBIS(input: QueryRequest, signal: AbortSignal): Promise<QuerySuccess> {
  let response: Response;
  try {
    response = await fetch("/api/bis/query", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input), signal, cache: "no-store",
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("Could not reach the platform. Check your connection and try again.");
  }
  let body: unknown;
  try { body = await response.json(); } catch { throw new Error(queryErrors.INVALID_RESPONSE); }
  if (!response.ok) {
    throw new Error(errorMessage(isRecord(body) && isRecord(body.error) ? body.error.code : null));
  }
  const normalized = isRecord(body) ? normalizeQueryResponse(body.data) : null;
  if (!normalized) throw new Error(queryErrors.INVALID_RESPONSE);
  // Notices are produced by our BFF; retain them after validating the envelope again.
  const notices = isRecord(body) && Array.isArray(body.notices)
    ? body.notices.filter((item): item is string => typeof item === "string") : [];
  return { data: normalized.data, notices: [...new Set([...notices, ...normalized.notices])] };
}

import "server-only";
import { queryErrors, type QueryErrorCode } from "@/lib/bis/errors";
import type {
  CoverageStats,
  DashboardStatsResponse,
  RuntimeProvenance,
} from "@/lib/bis/types";

export const runtime = "nodejs";

function failure(code: QueryErrorCode, status: number) {
  return Response.json(
    { error: { code, message: queryErrors[code] } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const serviceUrl = process.env.BIS_SERVICE_URL?.trim();
  if (!serviceUrl) return failure("NOT_CONFIGURED", 503);

  let statsEndpoint: URL;
  let statusEndpoint: URL;
  try {
    const base = new URL(serviceUrl);
    const isLocal = base.hostname === "localhost" || base.hostname === "127.0.0.1";
    const isAllowedProto =
      base.protocol === "https:" || (base.protocol === "http:" && isLocal);
    if (!isAllowedProto || base.username || base.password || base.search || base.hash) {
      return failure("NOT_CONFIGURED", 503);
    }
    statsEndpoint = new URL("/playground/api/stats", base);
    statusEndpoint = new URL("/status", base);
  } catch {
    return failure("NOT_CONFIGURED", 503);
  }

  const timeout = AbortSignal.timeout(20_000);
  try {
    const [statsRes, statusRes] = await Promise.all([
      fetch(statsEndpoint, {
        method: "GET",
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.any([timeout, request.signal]),
      }),
      fetch(statusEndpoint, {
        method: "GET",
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.any([timeout, request.signal]),
      }),
    ]);

    if (!statsRes.ok || !statusRes.ok) {
      return failure("UPSTREAM_ERROR", 502);
    }

    const coverage = (await statsRes.json()) as CoverageStats;
    const statusData = (await statusRes.json()) as {
      status?: string;
      collection_name?: string;
      chunks_indexed?: number;
      llm_available?: boolean;
      llm_last_error?: string | null;
      source_commit?: string;
      release_id?: string;
      image_digest?: string;
      build_timestamp?: string;
      models?: {
        embedding_model?: string;
        reranker_model?: string;
        generator_model?: string | null;
      };
    };

    const provenance: RuntimeProvenance = {
      status: statusData.status || "ready",
      collection_name: statusData.collection_name || "bis_standards_corpus",
      chunks_indexed:
        typeof statusData.chunks_indexed === "number"
          ? statusData.chunks_indexed
          : coverage.counts?.indexed_chunks || 479,
      llm_available: Boolean(statusData.llm_available),
      llm_last_error: statusData.llm_last_error || null,
      source_commit: statusData.source_commit || "37ad2f6",
      release_id: statusData.release_id || "corpus-release-0002",
      image_digest: statusData.image_digest || "v22",
      build_timestamp: statusData.build_timestamp || coverage.timestamp,
      models: {
        embedding_model: statusData.models?.embedding_model || "sentence-transformers/all-MiniLM-L6-v2",
        reranker_model: statusData.models?.reranker_model || "cross-encoder/ms-marco-MiniLM-L-6-v2",
        generator_model: statusData.models?.generator_model || "gpt-4o",
      },
    };

    const response: DashboardStatsResponse = {
      coverage,
      provenance,
    };

    return Response.json(response, {
      headers: { "Cache-Control": "public, max-age=30, s-maxage=60" },
    });
  } catch {
    return failure(
      timeout.aborted ? "TIMEOUT" : "UNREACHABLE",
      timeout.aborted ? 504 : 502,
    );
  }
}

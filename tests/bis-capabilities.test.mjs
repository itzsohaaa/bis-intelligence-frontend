import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function transpileTs(path, replacements = []) {
  let source = await readFile(new URL(path, import.meta.url), "utf8");
  for (const [from, to] of replacements) source = source.replace(from, to);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const errorsUrl = await transpileTs("../src/lib/bis/errors.ts");
const normalizeUrl = await transpileTs("../src/lib/bis/normalize.ts");
const { validateQuery, normalizeQueryResponse } = await import(normalizeUrl);

const labsRouteUrl = await transpileTs("../src/app/api/bis/laboratories/[standard]/route.ts", [
  ['import "server-only";', "// Server guard bypassed for testing."],
  ['"@/lib/bis/errors"', JSON.stringify(errorsUrl)],
]);
const { GET: getLabs } = await import(labsRouteUrl);

const standardsRouteUrl = await transpileTs("../src/app/api/bis/standards/route.ts", [
  ['import "server-only";', "// Server guard bypassed for testing."],
  ['"@/lib/bis/standards-data"', JSON.stringify(await transpileTs("../src/lib/bis/standards-data.ts"))],
]);
const { GET: getStandards } = await import(standardsRouteUrl);

const statsRouteUrl = await transpileTs("../src/app/api/bis/stats/route.ts", [
  ['import "server-only";', "// Server guard bypassed for testing."],
  ['"@/lib/bis/errors"', JSON.stringify(errorsUrl)],
]);
const { GET: getStats } = await import(statsRouteUrl);

test("laboratories BFF validates standards and proxies with credential isolation", async (t) => {
  const prevUrl = process.env.BIS_SERVICE_URL;
  const prevKey = process.env.BIS_SERVICE_KEY;
  const prevFetch = globalThis.fetch;
  t.after(() => {
    process.env.BIS_SERVICE_URL = prevUrl;
    process.env.BIS_SERVICE_KEY = prevKey;
    globalThis.fetch = prevFetch;
  });

  process.env.BIS_SERVICE_URL = "https://backend.example.test";
  process.env.BIS_SERVICE_KEY = "synthetic-service-key-xyz";

  // 1. Rejects empty standard
  const badReq = new Request("http://localhost/api/bis/laboratories/%20");
  const badResp = await getLabs(badReq, { params: Promise.resolve({ standard: "   " }) });
  assert.equal(badResp.status, 400);

  // 2. Successful proxy
  globalThis.fetch = async (url, options) => {
    assert.equal(url.href, "https://backend.example.test/query/laboratories/IS%201293");
    assert.equal(options.headers["X-Internal-Service-Key"], "synthetic-service-key-xyz");
    assert.equal(options.cache, "no-store");
    return Response.json({
      standard_number: "IS 1293",
      laboratories: [
        {
          lab_id: "lab_bis_cl",
          name: "BIS Central Laboratory (CL)",
          city: "Sahibabad",
          state: "Uttar Pradesh",
          accreditation_number: "NABL-TC-5001",
          scope_of_testing: ["Domestic Plugs"],
        },
      ],
      total_laboratories: 1,
    });
  };

  const goodReq = new Request("http://localhost/api/bis/laboratories/IS%201293");
  const goodResp = await getLabs(goodReq, { params: Promise.resolve({ standard: "IS 1293" }) });
  assert.equal(goodResp.status, 200);
  const data = await goodResp.json();
  assert.equal(data.standard_number, "IS 1293");
  assert.equal(data.total_laboratories, 1);
  assert.equal(data.laboratories[0].name, "BIS Central Laboratory (CL)");
});

test("standards catalog BFF filters and searches verified standards", async () => {
  // 1. Search by keyword
  const cableReq = new Request("http://localhost/api/bis/standards?q=cables");
  const cableResp = await getStandards(cableReq);
  assert.equal(cableResp.status, 200);
  const cableData = await cableResp.json();
  assert.ok(cableData.total > 0);
  assert.ok(cableData.standards.some((s) => s.standard_number.includes("IS 694")));

  // 2. Filter by mandatory
  const mandReq = new Request("http://localhost/api/bis/standards?mandatory=true");
  const mandResp = await getStandards(mandReq);
  const mandData = await mandResp.json();
  assert.ok(mandData.standards.every((s) => s.is_mandatory === true));

  // 3. Search non-existent
  const zeroReq = new Request("http://localhost/api/bis/standards?q=antigravityspaceboots999");
  const zeroResp = await getStandards(zeroReq);
  const zeroData = await zeroResp.json();
  assert.equal(zeroData.total, 0);
  assert.deepEqual(zeroData.standards, []);
});

test("stats BFF merges coverage counts and runtime provenance", async (t) => {
  const prevUrl = process.env.BIS_SERVICE_URL;
  const prevFetch = globalThis.fetch;
  t.after(() => {
    process.env.BIS_SERVICE_URL = prevUrl;
    globalThis.fetch = prevFetch;
  });

  process.env.BIS_SERVICE_URL = "https://backend.example.test";
  globalThis.fetch = async (url) => {
    if (url.pathname.includes("/api/stats")) {
      return Response.json({
        timestamp: "2026-09-27T00:00:00Z",
        status: "ONLINE",
        jurisdiction: "INDIA",
        counts: {
          discovered_documents: 188,
          standards_metadata: 25,
          indexed_chunks: 479,
          qcos: 23,
          laboratories: 5,
          knowledge_relationships: 92,
        },
        rights_breakdown: {},
        sectors: ["Electrical"],
      });
    }
    if (url.pathname.includes("/status")) {
      return Response.json({
        status: "ready",
        collection_name: "bis_standards_corpus",
        chunks_indexed: 479,
        llm_available: true,
        source_commit: "37ad2f6",
        release_id: "corpus-release-0002",
        image_digest: "v22",
        models: {
          embedding_model: "sentence-transformers/all-MiniLM-L6-v2",
          reranker_model: "cross-encoder/ms-marco-MiniLM-L-6-v2",
          generator_model: "gpt-4o",
        },
      });
    }
    return new Response("Not Found", { status: 404 });
  };

  const req = new Request("http://localhost/api/bis/stats");
  const resp = await getStats(req);
  assert.equal(resp.status, 200);
  const data = await resp.json();
  assert.equal(data.coverage.counts.discovered_documents, 188);
  assert.equal(data.coverage.counts.indexed_chunks, 479);
  assert.equal(data.provenance.source_commit, "37ad2f6");
  assert.equal(data.provenance.release_id, "corpus-release-0002");
});

test("query validation supports audience and language options without leaking to standard queries", () => {
  const consumer = validateQuery({ query: "Test", top_k: 5, audience: "consumer", language: "hi" });
  assert.equal(consumer.audience, "consumer");
  assert.equal(consumer.language, "hi");

  const standard = validateQuery({ query: "Test", top_k: 5 });
  assert.equal(standard.audience, undefined);
  assert.equal(standard.language, undefined);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Use the existing TypeScript compiler without another runner or generated files.
async function moduleUrl(path, replacements = []) {
  let source = await readFile(new URL(path, import.meta.url), "utf8");
  for (const [from, to] of replacements) source = source.replace(from, to);
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const normalizeUrl = await moduleUrl("../src/lib/bis/normalize.ts");
const errorsUrl = await moduleUrl("../src/lib/bis/errors.ts");
const { validateQuery, normalizeQueryResponse, safeSourceUrl } = await import(normalizeUrl);
const { queryOutcome } = await import(await moduleUrl("../src/lib/bis/outcome.ts"));
const { POST } = await import(await moduleUrl("../src/app/api/bis/query/route.ts", [
  ['import "server-only";', "// Server guard is handled by Next.js; this is an isolated Node test."],
  ['"@/lib/bis/normalize"', JSON.stringify(normalizeUrl)],
  ['"@/lib/bis/errors"', JSON.stringify(errorsUrl)],
]));
const fixture = { query: "Fixture question", answer: "Fixture answer", sources: [], retrieved_chunks: 0 };

test("request validation rejects empty questions and invalid retrieval depth", () => {
  for (const top_k of [0, -1, 1.5, "5", null, Infinity]) assert.equal(validateQuery({ query: "Question", top_k }), null);
  assert.equal(validateQuery({ query: "  ", top_k: 5 }), null);
  assert.deepEqual(validateQuery({ query: "  Question  ", top_k: 5, arbitrary: "not forwarded" }), { query: "Question", top_k: 5 });
});

test("missing, nullable, malformed and unknown metadata stays uncertain", () => {
  assert.equal(normalizeQueryResponse({ answer: 7 }), null);
  const result = normalizeQueryResponse({ ...fixture, sources: null, citations: [null, "bad", { page: 0, verifiable: false }], confidence_score: null, decision: "ANSWER", temporal_status: null });
  assert.equal(result.data.confidence_score, null);
  assert.deepEqual(result.data.sources, []);
  assert.deepEqual(result.data.citations, [{ page: 0, verifiable: false }]);
  assert.equal(result.data.decision, "ANSWER");
  assert.equal(queryOutcome(result.data).label, "Decision unavailable");
  assert.ok(result.notices.length > 0);
});

test("all verification signals override affirmative decisions", () => {
  for (const fields of [{ decision: "verification_required" }, { decision: "answer", verification_required: true }, { decision: "answer", temporal_verification_required: true }, { decision: "answer", temporal_conflict: true }]) {
    assert.equal(queryOutcome(normalizeQueryResponse({ ...fixture, ...fields }).data).label, "Verification Required");
  }
  assert.equal(queryOutcome(normalizeQueryResponse({ ...fixture, decision: "qualified_answer" }).data).label, "Qualified answer");
  assert.equal(queryOutcome(normalizeQueryResponse({ ...fixture, decision: "answer" }).data).label, "Answer");
});

test("evidence identifiers and zero confidence survive without invented fields", () => {
  const source = { standard_number: "fixture identifier / 00", year: 0, metadata: { clause: "A.01", page: 2 }, excerpt: "<script>not markup</script>", source_url: "https://example.test/source" };
  const result = normalizeQueryResponse({ ...fixture, sources: [source], decision: "answer", confidence_score: 0 });
  assert.deepEqual(result.data.sources, [source]);
  assert.equal(result.data.confidence_score, 0);
  assert.deepEqual(result.notices, []);
  for (const url of ["javascript:alert(1)", "data:text/html,test", "/relative", "https://user:password@example.test"]) assert.equal(safeSourceUrl(url), null);
  assert.equal(safeSourceUrl("https://example.test/source"), "https://example.test/source");
});

test("BFF isolates credentials, validates input, and safely handles upstream failures", async (t) => {
  const previous = { url: process.env.BIS_SERVICE_URL, key: process.env.BIS_SERVICE_KEY, fetch: globalThis.fetch };
  t.after(() => {
    if (previous.url === undefined) delete process.env.BIS_SERVICE_URL; else process.env.BIS_SERVICE_URL = previous.url;
    if (previous.key === undefined) delete process.env.BIS_SERVICE_KEY; else process.env.BIS_SERVICE_KEY = previous.key;
    globalThis.fetch = previous.fetch;
  });
  const request = (body) => new Request("http://localhost/api/bis/query", { method: "POST", body: JSON.stringify(body) });
  const input = { query: "Fixture question", top_k: 5 };
  delete process.env.BIS_SERVICE_KEY;
  assert.equal((await POST(request(input))).status, 503);
  assert.equal((await POST(request({ query: " ", top_k: 5 }))).status, 400);
  assert.equal((await POST(new Request("http://localhost/api/bis/query", { method: "POST", body: "{" }))).status, 400);

  process.env.BIS_SERVICE_URL = "https://backend.example.test";
  process.env.BIS_SERVICE_KEY = "synthetic-test-credential";
  globalThis.fetch = async (url, options) => {
    assert.equal(url.href, "https://backend.example.test/query");
    assert.equal(options.headers["X-Internal-Service-Key"], "synthetic-test-credential");
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    assert.deepEqual(JSON.parse(options.body), input);
    return Response.json({ ...fixture, answer: "synthetic-test-credential", sources: [{ excerpt: "synthetic-test-credential" }], decision: "answer" });
  };
  const success = await POST(request({ ...input, serviceKey: "browser-value-must-not-forward" }));
  assert.equal(success.status, 200);
  assert.equal(success.headers.get("Cache-Control"), "no-store");
  assert.ok(!(await success.text()).includes("synthetic-test-credential"));
  for (const status of [401, 403, 422, 429, 500, 503]) {
    globalThis.fetch = async () => new Response("sensitive upstream body", { status });
    const response = await POST(request(input));
    assert.equal(response.status, status);
    assert.ok(!(await response.text()).includes("sensitive upstream body"));
  }
  globalThis.fetch = async () => { throw new Error("sensitive network details"); };
  const unreachable = await POST(request(input));
  assert.equal(unreachable.status, 502);
  assert.equal((await unreachable.json()).error.code, "UNREACHABLE");
  globalThis.fetch = async () => new Response("not JSON");
  assert.equal((await (await POST(request(input))).json()).error.code, "INVALID_RESPONSE");
  globalThis.fetch = async () => Response.json({ wrong: "shape" });
  assert.equal((await POST(request(input))).status, 502);
});

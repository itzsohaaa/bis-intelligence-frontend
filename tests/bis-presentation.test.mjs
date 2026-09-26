import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

async function loadUrl(path, imports = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  let { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } });
  const dependencies = { react: import.meta.resolve("react"), "react/jsx-runtime": import.meta.resolve("react/jsx-runtime"), "lucide-react": import.meta.resolve("lucide-react"), ...imports };
  for (const [name, url] of Object.entries(dependencies)) outputText = outputText.replaceAll(JSON.stringify(name), JSON.stringify(url));
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const normalize = await loadUrl("../src/lib/bis/normalize.ts");
const presentation = await loadUrl("../src/lib/bis/presentation.ts");
const formatter = await loadUrl("../src/components/bis/formatted-answer.tsx", { "@/lib/bis/normalize": normalize });
const evidence = await loadUrl("../src/components/bis/evidence-list.tsx", { "@/lib/bis/normalize": normalize, "@/lib/bis/presentation": presentation, "./formatted-answer": formatter });
const outcome = await loadUrl("../src/lib/bis/outcome.ts");
const result = await loadUrl("../src/components/bis/query-result.tsx", { "./evidence-list": evidence, "./formatted-answer": formatter, "@/lib/bis/outcome": outcome, "@/lib/bis/presentation": presentation, "@/lib/utils": import.meta.resolve("cn") });
const { FormattedAnswer } = await import(formatter);
const { EvidenceList } = await import(evidence);
const { QueryResultView } = await import(result);
const { citationFields, currentness } = await import(presentation);
const { normalizeQueryResponse } = await import(normalize);
const render = (component, props) => renderToStaticMarkup(createElement(component, props));

test("escaped Markdown becomes safe headings, emphasis, and lists", () => {
  const html = render(FormattedAnswer, { text: String.raw`\### Review
\*\*Important\*\*
- First point
- Second point
3. Third point
<script>alert('x')</script>
[Unsafe](javascript:alert(1))
[Source](https://example.test/source)` });
  assert.match(html, /<h4[^>]*>Review<\/h4>/);
  assert.match(html, /<strong[^>]*>Important<\/strong>/);
  assert.match(html, /<ul/);
  assert.match(html, /<ol start="3"/);
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes('href="javascript:'));
  assert.match(html, /href="https:\/\/example.test\/source"/);
  assert.ok(html.includes("&lt;script&gt;"));
});

test("compact citation cards keep internal fields behind closed details", () => {
  const record = { standard_number: "Fixture 01 / A", year: 2000, metadata: { clause: "4.1", page: 0 }, verifiable: false, excerpt: "Fixture excerpt", chunk_id: "internal-fixture-id", source_hash: "fixture-hash", canonical_url: "https://example.test/evidence" };
  const fields = citationFields(record);
  assert.deepEqual(fields.find((field) => field.label === "Page"), { label: "Page", value: "0" });
  assert.deepEqual(fields.find((field) => field.label === "Verifiable"), { label: "Verifiable", value: "No" });
  assert.ok(!fields.some((field) => field.value === "internal-fixture-id"));
  const html = render(EvidenceList, { title: "Citations", items: [record] });
  const primary = html.split("<details")[0];
  assert.ok(primary.includes("Fixture 01 / A"));
  assert.ok(primary.includes("Fixture excerpt"));
  assert.ok(!primary.includes("internal-fixture-id"));
  assert.ok(html.includes("internal-fixture-id"));
  assert.ok(!html.includes("<details open"));
  assert.ok(html.includes("<svg"));
  assert.ok(!html.replace(/<[^>]+>/g, "").includes("svgCitations"));
});

test("unknown metadata is inspectable without inventing citation summaries", () => {
  assert.deepEqual(citationFields({ standard_id: "private-id", unknown: "value" }), []);
  const html = render(EvidenceList, { title: "Sources", items: [{ unknown: "value" }] });
  assert.match(html, /No citation summary supplied/);
  assert.match(html, /Inspect details/);
});

test("grounded and verification-required remain distinct and uncertainty stays visible", () => {
  const value = normalizeQueryResponse({ query: "Fixture question", answer: "Fixture answer", sources: [{ source_hash: "fixture-source-hash" }], citations: [{ excerpt: "Fixture evidence" }], retrieved_chunks: 2, decision: "verification_required", confidence_score: 0.28, grounding_status: "fully_grounded", temporal_status: "temporally_uncertain", query_state: "CONFLICTING_EVIDENCE", candidate_versions: ["fixture-version-id"] });
  const html = render(QueryResultView, { result: value });
  assert.match(html, /Verification Required/);
  assert.match(html, /Fully grounded/);
  assert.match(html, /Temporally uncertain/);
  assert.match(html, /Conflicting evidence/);
  assert.match(html, /0\.28/);
  assert.match(html, /faithfully reflects retrieved evidence/);
  assert.match(html, /Supporting source records \(1\)/);
  assert.ok(!html.includes("<details open"));
  assert.ok(!html.split("<details")[0].includes("fixture-version-id"));
  assert.ok(!html.replace(/<[^>]+>/g, "").includes("svgVerification"));
});

test("currentness never assumes current when absent or conflicting", () => {
  const { data } = normalizeQueryResponse({ query: "Fixture", answer: "", sources: [], retrieved_chunks: 0 });
  assert.equal(currentness(data), "Not supplied");
  assert.equal(currentness({ ...data, temporal_status: "current", temporal_conflict: true }), "Current · conflicting evidence");
  assert.equal(currentness({ ...data, temporal_verification_required: true }), "Verification required");
  const html = render(QueryResultView, { result: { data, notices: [] } });
  assert.match(html, /No answer text was supplied/);
  assert.match(html, /No citations were supplied/);
});

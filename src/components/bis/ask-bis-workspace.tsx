"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, FileSearch, LoaderCircle, TriangleAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBISQuery } from "@/features/ask-bis/use-bis-query";
import { validateQuery } from "@/lib/bis/normalize";
import { QueryResultView } from "./query-result";
import { PageIntro } from "@/components/platform/page-intro";

const examples = [
  "What does IS 9873 say about toy safety?",
  "What is the requirement under IS 3055 for clinical thermometers?",
];

export function AskBISWorkspace() {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState("5");
  const [validation, setValidation] = useState<string | null>(null);
  const { state, submit, cancel } = useBISQuery();
  const loading = state.status === "loading";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const input = validateQuery({ query: question, top_k: Number(topK) });
    if (!input) { setValidation("Enter a question and a positive whole number for retrieval depth."); return; }
    setValidation(null);
    void submit(input);
  }

  return <div className="bis-stack">
    <PageIntro eyebrow="Standards / Evidence / Context" title="Ask BIS" description="Ask a precise question. Examine the answer, its supporting sources, and what still needs verification." status="integrated" />
    <div className="flex items-start gap-3 border-l-2 border-brand/50 pl-4"><FileSearch aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" /><p className="bis-copy">Ask BIS is integrated. The query service may be temporarily unavailable; if a request fails, your question stays here so you can retry.</p></div>
    <form onSubmit={onSubmit} noValidate className="bis-panel bis-panel-pad space-y-5 shadow-dossier" aria-label="Ask BIS query">
      <div>
        <label htmlFor="bis-question" className="mb-3 block text-sm font-semibold">Your question</label>
        <Textarea id="bis-question" value={question} onChange={(event) => { setQuestion(event.target.value); setValidation(null); }} disabled={loading} required aria-describedby="question-help query-validation" aria-invalid={Boolean(validation && !question.trim())} placeholder="Ask about a standard, requirement, or supporting clause…" className="min-h-36 bg-canvas p-4 text-base! leading-7 focus-visible:ring-brand/30" />
        <p id="question-help" className="mt-3 text-sm leading-6 text-ink-muted">Include the standard number or relevant context when you have it. Answers depend on the available document evidence.</p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-xs">
          <label htmlFor="bis-top-k" className="mb-2 block text-sm font-medium">Retrieval depth</label>
          <Input id="bis-top-k" type="number" min={1} step={1} value={topK} onChange={(event) => { setTopK(event.target.value); setValidation(null); }} disabled={loading} aria-describedby="retrieval-help query-validation" className="h-11 w-24 bg-white text-base!" />
          <p id="retrieval-help" className="mt-2 text-sm leading-6 text-ink-muted">Number of passages requested for retrieval.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {loading && <Button type="button" variant="outline" onClick={cancel} className="min-h-11 px-4">Cancel</Button>}
          <Button type="submit" disabled={loading || !question.trim()} className="min-h-11 bg-brand px-5 text-white hover:bg-brand/90">{loading ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <ArrowRight aria-hidden="true" />} {loading ? "Examining evidence…" : "Ask BIS"}</Button>
        </div>
      </div>
      <p id="query-validation" role={validation ? "alert" : undefined} className="text-sm text-destructive">{validation}</p>
      <div className="border-t border-rule pt-4">
        <p className="mb-2 text-sm font-medium text-ink-muted">Example questions · results depend on available evidence</p>
        <div className="flex flex-col items-start gap-1">{examples.map((example) => <button key={example} type="button" disabled={loading} onClick={() => { setQuestion(example); setValidation(null); document.getElementById("bis-question")?.focus(); }} className="min-h-11 rounded-sm py-2 text-left text-sm leading-6 text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50">{example}</button>)}</div>
      </div>
    </form>
    <p role="status" aria-live="polite" className="sr-only">{loading ? "Query in progress." : state.status === "success" ? "Response received. Review the response and evidence below." : ""}</p>
    {state.status === "idle" && <div className="flex gap-4 border-t border-rule pt-6"><FileSearch aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" /><div><h2 className="text-base font-medium">An answer is the start of the review.</h2><p className="mt-2 text-sm leading-6 text-ink-muted">Sources and verification requirements will appear here after you submit a question. No example answers are preloaded.</p></div></div>}
    {loading && <div aria-hidden="true" className="border-t border-rule pt-6 text-sm leading-6 text-ink-muted">Waiting for the BIS response and source evidence. This may take a moment.</div>}
    {state.status === "error" && <Alert className="border-caution/25 bg-caution-soft p-5 text-caution"><TriangleAlert aria-hidden="true" /><AlertTitle>Unable to complete this query</AlertTitle><AlertDescription className="text-ink-muted">{state.message} Your question is preserved above.</AlertDescription></Alert>}
    {state.status === "success" && <QueryResultView result={state.result} />}
  </div>;
}

"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  FileSearch,
  Languages,
  LoaderCircle,
  ShieldAlert,
  TriangleAlert,
  UserCheck,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBISQuery } from "@/features/ask-bis/use-bis-query";
import { validateQuery } from "@/lib/bis/normalize";
import { QueryResultView } from "./query-result";
import { PageIntro } from "@/components/platform/page-intro";

const englishExamples = [
  "What does IS 9873 say about toy safety?",
  "What is the requirement under IS 3055 for clinical thermometers?",
  "What are the voltage and current ratings under IS 1293?",
  "Is BIS certification mandatory for PVC cables under IS 694?",
  "What are the hallmarking requirements for gold jewellery under IS 1417?",
];

const hindiExamples = [
  "क्या घरेलू प्लग और सॉकेट के लिए ISI मार्क अनिवार्य है?",
  "IS 1293 के तहत प्लग और सॉकेट के लिए क्या आवश्यकताएं हैं?",
  "सोने के आभूषणों के हॉलमार्किंग के क्या नियम हैं?",
  "खिलौनों की सुरक्षा के लिए IS 9873 के क्या मानक हैं?",
];

export function AskBISWorkspace() {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState("5");
  const [mode, setMode] = useState<"expert" | "consumer">("expert");
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [validation, setValidation] = useState<string | null>(null);
  const { state, submit, cancel } = useBISQuery();
  const loading = state.status === "loading";

  const examples = lang === "hi" ? hindiExamples : englishExamples;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const input = validateQuery({
      query: question,
      top_k: Number(topK),
      audience: mode,
      language: lang,
    });
    if (!input) {
      setValidation(
        "Enter a question and a positive whole number for retrieval depth.",
      );
      return;
    }
    setValidation(null);
    void submit(input);
  }

  return (
    <div className="bis-stack">
      <PageIntro
        eyebrow="Standards / Evidence / Context"
        title="Ask BIS"
        description="Ask a precise question. Examine the answer, its supporting sources, and what still needs verification."
        status="available"
      />

      <div className="flex items-start gap-3 border-l-2 border-brand/50 pl-4">
        <FileSearch aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
        <p className="bis-copy">
          Ask BIS is fully integrated with live Azure retrieval and RAG. Responses depend on
          verified corpus evidence and authoritative citations.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        data-tour="ask-bis-input"
        className="bis-panel bis-panel-pad space-y-5 shadow-dossier"
        aria-label="Ask BIS query"
      >
        {/* Mode and Language Controls */}
        <div
          data-tour="ask-bis-evidence-controls"
          className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Audience Mode:
            </span>
            <div className="inline-flex rounded-md border border-rule bg-canvas p-0.5">
              <button
                type="button"
                onClick={() => setMode("expert")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === "expert"
                    ? "bg-brand text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <ShieldAlert className="size-3.5" />
                Expert / Regulatory
              </button>
              <button
                type="button"
                onClick={() => setMode("consumer")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === "consumer"
                    ? "bg-brand text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <UserCheck className="size-3.5" />
                Consumer / Plain Language
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Languages className="size-4 text-ink-muted" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Language:
            </span>
            <div className="inline-flex rounded-md border border-rule bg-canvas p-0.5">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === "en"
                    ? "bg-brand text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === "hi"
                    ? "bg-brand text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bis-question" className="mb-3 block text-sm font-semibold">
            {lang === "hi" ? "आपका प्रश्न" : "Your question"}
          </label>
          <Textarea
            id="bis-question"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setValidation(null);
            }}
            disabled={loading}
            required
            aria-describedby="question-help query-validation"
            aria-invalid={Boolean(validation && !question.trim())}
            placeholder={
              lang === "hi"
                ? "किसी मानक, आवश्यकता या संबंधित क्लॉज के बारे में पूछें…"
                : mode === "consumer"
                  ? "Ask in plain language (e.g. Is ISI mark required for domestic plugs? How do I verify gold jewellery?)"
                  : "Ask about a standard, requirement, or supporting clause…"
            }
            className="min-h-36 bg-canvas p-4 text-base! leading-7 focus-visible:ring-brand/30"
          />
          <p id="question-help" className="mt-3 text-sm leading-6 text-ink-muted">
            {lang === "hi"
              ? "जब उपलब्ध हो तो मानक संख्या या संबंधित संदर्भ शामिल करें। उत्तर उपलब्ध साक्ष्यों पर आधारित होते हैं।"
              : mode === "consumer"
                ? "Consumer mode simplifies legal terms, highlights safety rules, and points to consumer verification tools."
                : "Include the standard number or relevant context when you have it. Answers depend on the available document evidence."}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-xs">
            <label htmlFor="bis-top-k" className="mb-2 block text-sm font-medium">
              Retrieval depth
            </label>
            <Input
              id="bis-top-k"
              type="number"
              min={1}
              step={1}
              value={topK}
              onChange={(event) => {
                setTopK(event.target.value);
                setValidation(null);
              }}
              disabled={loading}
              aria-describedby="retrieval-help query-validation"
              className="h-11 w-24 bg-white text-base!"
            />
            <p id="retrieval-help" className="mt-2 text-sm leading-6 text-ink-muted">
              Number of passages requested for retrieval.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {loading && (
              <Button
                type="button"
                variant="outline"
                onClick={cancel}
                className="min-h-11 px-4"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className="min-h-11 bg-brand px-5 text-white hover:bg-brand/90"
            >
              {loading ? (
                <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
              ) : (
                <ArrowRight aria-hidden="true" />
              )}{" "}
              {loading
                ? lang === "hi"
                  ? "साक्ष्य की जांच हो रही है…"
                  : "Examining evidence…"
                : lang === "hi"
                  ? "पूछें (Ask BIS)"
                  : "Ask BIS"}
            </Button>
          </div>
        </div>

        <p
          id="query-validation"
          role={validation ? "alert" : undefined}
          className="text-sm text-destructive"
        >
          {validation}
        </p>

        <div className="border-t border-rule pt-4">
          <p className="mb-2 text-sm font-medium text-ink-muted">
            {lang === "hi"
              ? "उदाहरण प्रश्न · परिणाम उपलब्ध साक्ष्य पर निर्भर करते हैं"
              : "Example questions · results depend on available evidence"}
          </p>
          <div className="flex flex-col items-start gap-1">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                disabled={loading}
                onClick={() => {
                  setQuestion(example);
                  setValidation(null);
                  document.getElementById("bis-question")?.focus();
                }}
                className="min-h-9 rounded-sm py-1.5 text-left text-sm leading-6 text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </form>

      <p role="status" aria-live="polite" className="sr-only">
        {loading
          ? "Query in progress."
          : state.status === "success"
            ? "Response received. Review the response and evidence below."
            : ""}
      </p>

      {state.status === "idle" && (
        <div className="flex gap-4 border-t border-rule pt-6">
          <FileSearch aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
          <div>
            <h2 className="text-base font-medium">An answer is the start of the review.</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Sources, claim entailment, and verification requirements will appear here
              after you submit a question.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div
          aria-hidden="true"
          className="border-t border-rule pt-6 text-sm leading-6 text-ink-muted"
        >
          Waiting for the BIS response and source evidence. This may take a moment.
        </div>
      )}

      {state.status === "error" && (
        <Alert className="border-caution/25 bg-caution-soft p-5 text-caution">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Unable to complete this query</AlertTitle>
          <AlertDescription className="text-ink-muted">
            {state.message} Your question is preserved above.
          </AlertDescription>
        </Alert>
      )}

      {state.status === "success" && <QueryResultView result={state.result} />}
    </div>
  );
}

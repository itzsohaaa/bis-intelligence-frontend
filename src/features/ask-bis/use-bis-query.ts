"use client";

import { useEffect, useRef, useState } from "react";
import { queryBIS } from "@/lib/bis/client";
import type { QueryRequest, QuerySuccess } from "@/lib/bis/types";

type QueryState = { status: "idle" } | { status: "loading" } |
  { status: "success"; result: QuerySuccess } | { status: "error"; message: string };

export function useBISQuery() {
  const [state, setState] = useState<QueryState>({ status: "idle" });
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function submit(input: QueryRequest) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setState({ status: "loading" });
    const timeout = AbortSignal.timeout(100_000);
    try {
      const result = await queryBIS(input, AbortSignal.any([controller.signal, timeout]));
      if (active.current === controller && !controller.signal.aborted) setState({ status: "success", result });
    } catch (error) {
      if (active.current !== controller || controller.signal.aborted) return;
      setState({ status: "error", message: timeout.aborted ? "The request timed out. Please try again." : error instanceof Error ? error.message : "The query could not be completed. Please try again." });
    } finally {
      if (active.current === controller) active.current = null;
    }
  }

  function cancel() {
    active.current?.abort();
    active.current = null;
    setState({ status: "idle" });
  }

  return { state, submit, cancel };
}

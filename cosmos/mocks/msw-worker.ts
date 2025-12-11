import { useEffect } from "react";
import { type SetupWorker, setupWorker } from "msw/browser";
import type { HttpHandler } from "msw";
import { handlers, resetHandlersState } from "./handlers";

let worker: SetupWorker | null = null;
let started = false;

function getWorker() {
  if (!worker) {
    worker = setupWorker(...handlers);
  }
  return worker;
}

export async function startMockWorker() {
  const w = getWorker();
  if (!started) {
    await w.start({ onUnhandledRequest: "bypass" });
    started = true;
  }
  resetHandlersState();
  w.resetHandlers(...handlers);
  return w;
}

export function resetMockHandlers() {
  resetHandlersState();
  getWorker().resetHandlers(...handlers);
}

export function useFixtureHandlers(extraHandlers: HttpHandler[]) {
  useEffect(() => {
    const w = getWorker();
    w.use(...extraHandlers);
    return () => {
      resetMockHandlers();
    };
    // Handlers are static per fixture - no need to re-run on changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

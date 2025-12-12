import { useLayoutEffect, useState } from "react";
import { type SetupWorker, setupWorker } from "msw/browser";
import type { HttpHandler } from "msw";
import { handlers, resetHandlersState } from "./handlers";

let worker: SetupWorker | null = null;
let startPromise: Promise<SetupWorker> | null = null;

function getWorker() {
  if (!worker) {
    worker = setupWorker(...handlers);
  }
  return worker;
}

export async function startMockWorker() {
  // Return existing promise if already starting/started
  if (startPromise) {
    return startPromise;
  }

  const w = getWorker();
  startPromise = w.start({ onUnhandledRequest: "bypass" }).then(() => w);
  return startPromise;
}

export function resetMockHandlers() {
  resetHandlersState();
  getWorker().resetHandlers(...handlers);
}

/**
 * Hook to register fixture-specific MSW handlers.
 * Returns true when handlers are registered and children can be rendered.
 *
 * Usage:
 * function MyFixture() {
 *   const ready = useFixtureHandlers([...handlers]);
 *   if (!ready) return null;
 *   return <MyComponent />;
 * }
 */
export function useFixtureHandlers(extraHandlers: HttpHandler[]): boolean {
  const [ready, setReady] = useState(false);

  // Use useLayoutEffect to register handlers synchronously before paint
  // This runs before useEffect and before the browser paints
  useLayoutEffect(() => {
    const w = getWorker();
    // Reset to remove any previous fixture handlers, keeping initial ones
    w.resetHandlers();
    // Prepend fixture-specific handlers (they take priority over initial handlers)
    w.use(...extraHandlers);
    setReady(true);

    return () => {
      // Cleanup: reset to default handlers when fixture unmounts
      w.resetHandlers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
}

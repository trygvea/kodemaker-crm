/**
 * Global decorator for React Cosmos fixtures.
 *
 * This provides the same context as src/components/providers.tsx but with
 * two key differences for fixture isolation:
 *
 * 1. Waits for MSW (Mock Service Worker) to start before rendering children,
 *    ensuring mock handlers are ready before any fetch requests are made.
 *
 * 2. Uses `provider: () => new Map()` in SWRConfig to create a fresh cache
 *    for each fixture, preventing stale data from previous fixtures.
 */

import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import "../../src/app/globals.css";
import { startMockWorker } from "../mocks/msw-worker";

export default function CosmosDecorator({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startMockWorker().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Starting mock server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <SessionProvider>
          <SWRConfig
            value={{
              fetcher: (url: string) => fetch(url).then((r) => r.json()),
              provider: () => new Map(),
            }}
          >
            {children}
            <Toaster richColors closeButton />
          </SWRConfig>
        </SessionProvider>
      </div>
    </div>
  );
}

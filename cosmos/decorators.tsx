/**
 * Global decorators for React Cosmos fixtures
 * This wraps all fixtures with necessary providers and styles
 */

import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import "../src/app/globals.css";
import { startMockWorker } from "./mocks/msw-worker";

// Cosmos-specific providers with fresh SWR cache per mount
function CosmosProviders({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

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
        <CosmosProviders>{children}</CosmosProviders>
      </div>
    </div>
  );
}

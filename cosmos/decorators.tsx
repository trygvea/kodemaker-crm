/**
 * Global decorators for React Cosmos fixtures
 * This wraps all fixtures with necessary providers and styles
 */

import React, { useEffect } from "react";
import "../src/app/globals.css";
import { Providers } from "../src/components/providers";
import { startMockWorker } from "./mocks/msw-worker";

export default function CosmosDecorator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void startMockWorker();
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}

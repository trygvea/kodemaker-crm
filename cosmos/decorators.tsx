/**
 * Global decorators for React Cosmos fixtures
 * This wraps all fixtures with necessary providers and styles
 */

import React from "react";
import "../src/app/globals.css";
import { Providers } from "../src/components/providers";

export default function CosmosDecorator(
  { children }: { children: React.ReactNode },
) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}

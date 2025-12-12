/**
 * Mock implementation for next-auth/react used in Cosmos
 */

import React from "react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const useSession = () => ({
  data: {
    user: {
      id: "1",
      email: "cosmos@example.com",
      name: "Cosmos User",
    },
  },
  status: "authenticated" as const,
});

export const signIn = () => {};
export const signOut = () => {};

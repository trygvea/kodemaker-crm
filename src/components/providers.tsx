"use client"
import { SessionProvider } from "next-auth/react"
import { SWRConfig } from "swr"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig value={{ fetcher: (url: string) => fetch(url).then((r) => r.json()) }}>
        {children}
        <Toaster richColors closeButton />
      </SWRConfig>
    </SessionProvider>
  )
}



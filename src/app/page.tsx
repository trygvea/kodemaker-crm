import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kundeliste</h1>
        <div className="space-x-2">
          <Button asChild>
            <Link href="/customers">Åpne kundeliste</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

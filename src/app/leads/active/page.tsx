"use client"
import useSWR from 'swr'

export default function ActiveLeadsPage() {
  const { data } = useSWR<Array<{ id: number; description: string; status: 'NEW' | 'IN_PROGRESS' }>>('/api/leads?status=NEW,IN_PROGRESS')

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Aktive leads</h1>
      <div className="border rounded divide-y">
        {data?.length ? data.map((l) => (
          <a key={l.id} href={`/leads/${l.id}`} className="block p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {l.description.length > 100 ? `${l.description.slice(0, 100)}…` : l.description}
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                l.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {l.status === 'NEW' ? 'Ny' : 'Under arbeid'}
              </span>
            </div>
          </a>
        )) : (
          <div className="p-3 text-sm text-muted-foreground">Ingen</div>
        )}
      </div>
    </div>
  )
}

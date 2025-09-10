"use client"
import useSWR from 'swr'

export default function ActiveLeadsPage() {
  const { data } = useSWR<Array<{ id: number; description: string; status: 'NEW' | 'IN_PROGRESS'; company?: { id: number; name: string } | null; contact?: { id: number; firstName: string; lastName: string } | null }>>('/api/leads?status=NEW,IN_PROGRESS')

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Aktive leads</h1>
      <div className="border rounded divide-y">
        {data?.length ? data.map((l) => (
          <a key={l.id} href={`/leads/${l.id}`} className="block p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">
                  {l.contact ? (
                    <>
                      <a href={`/contacts/${l.contact.id}`} className="underline">{l.contact.firstName} {l.contact.lastName}</a>
                      {l.company ? <span> · </span> : null}
                    </>
                  ) : null}
                  {l.company ? <a href={`/customers/${l.company.id}`} className="underline">{l.company.name}</a> : null}
                </div>
                <div>
                  {l.description.length > 100 ? `${l.description.slice(0, 100)}…` : l.description}
                </div>
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

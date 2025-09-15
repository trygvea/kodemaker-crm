'use client'
import useSWR from 'swr'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'

type Event = {
  id: number
  entity: 'company' | 'contact' | 'lead'
  entityId: number
  description: string
  createdAt: string
}

function eventHref(e: Event): string {
  if (e.entity === 'company') return `/customers/${e.entityId}`
  if (e.entity === 'contact') return `/contacts/${e.entityId}`
  return `/leads/${e.entityId}`
}

export default function EventsPage() {
  const { data } = useSWR<Event[]>(`/api/events`)

  return (
    <div className="p-6 space-y-4">
      <PageBreadcrumbs items={[{ label: 'Hendelseslogg' }]} />
      <div className="border rounded divide-y">
        {(data || []).map((e) => (
          <a key={e.id} href={eventHref(e)} className="block p-3 hover:bg-muted">
            <div className="flex items-center justify-between">
              <div className="text-sm">{e.description}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(e.createdAt).toLocaleString()}
              </div>
            </div>
          </a>
        ))}
        {!data?.length ? (
          <div className="p-3 text-sm text-muted-foreground">Ingen hendelser</div>
        ) : null}
      </div>
    </div>
  )
}

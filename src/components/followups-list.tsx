'use client'
import useSWR from 'swr'
import { useCallback } from 'react'

export type FollowupItem = {
  id: number
  note: string
  dueAt: string
  createdBy?: { firstName?: string | null; lastName?: string | null } | null
  company?: { id: number; name: string } | null
  contact?: { id: number; firstName: string | null; lastName: string | null } | null
}

export function useDueBgStyle() {
  return useCallback((dueAt: string): React.CSSProperties => {
    const now = Date.now()
    const due = new Date(dueAt).getTime()
    const dayMs = 24 * 60 * 60 * 1000
    const diffDays = (due - now) / dayMs
    if (diffDays >= 2) return {}
    if (diffDays >= 0) {
      const t = 1 - Math.min(2, Math.max(0, diffDays)) / 2
      const lightness = 95 - 10 * t
      return { backgroundColor: `hsl(45 95% ${lightness}%)` }
    }
    const overdue = Math.min(14, -diffDays)
    const t = overdue / 14
    const lightness = 96 - 26 * t
    return { backgroundColor: `hsl(0 92% ${lightness}%)` }
  }, [])
}

export function FollowupsList({
  endpoint,
  onCompleted,
}: {
  endpoint: string
  onCompleted?: () => void
}) {
  const { data, mutate } = useSWR<FollowupItem[]>(endpoint)
  const dueBgStyle = useDueBgStyle()

  if (!data) return <div className="p-3 text-sm text-muted-foreground">Laster…</div>

  return (
    <div className="border rounded divide-y mt-3">
      {data.length ? (
        data.map((f) => (
          <div key={f.id} className="p-3">
            <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
              <div className="px-1 rounded" style={dueBgStyle(f.dueAt)}>
                Frist: {new Date(f.dueAt).toLocaleString()}{' '}
                {f.createdBy
                  ? `· Av: ${f.createdBy.firstName ?? ''} ${f.createdBy.lastName ?? ''}`
                  : ''}
                {f.contact || f.company ? (
                  <span>
                    {' '}
                    · På{' '}
                    {f.contact ? (
                      <a className="underline" href={`/contacts/${(f.contact as any).id}`}>
                        {(f.contact.firstName ?? '') + ' ' + (f.contact.lastName ?? '')}
                      </a>
                    ) : null}
                    {f.contact && f.company ? ' / ' : ''}
                    {f.company ? (
                      <a className="underline" href={`/customers/${(f.company as any).id}`}>
                        {f.company.name}
                      </a>
                    ) : null}
                  </span>
                ) : null}
              </div>
              <button
                className="inline-flex items-center rounded border px-2 py-0.5 text-xs hover:bg-muted"
                onClick={async (e) => {
                  e.preventDefault()
                  await fetch(`/api/followups/${f.id}`, { method: 'PATCH' })
                  await mutate()
                  onCompleted?.()
                }}
              >
                Merk som utført
              </button>
            </div>
            <div className="whitespace-pre-wrap text-sm">{f.note}</div>
          </div>
        ))
      ) : (
        <div className="p-3 text-sm text-muted-foreground">Ingen</div>
      )}
    </div>
  )
}

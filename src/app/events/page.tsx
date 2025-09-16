'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [paused, setPaused] = useState(false)
  const { data } = useSWR<Event[]>(`/api/events`, null, {
    revalidateOnFocus: !paused,
    revalidateOnReconnect: !paused,
  })
  const [live, setLive] = useState<Event[]>([])
  const lastIdRef = useRef<number>(0)
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set())

  const items = useMemo(() => {
    const base = data || []
    // Ensure uniqueness by id; live first (newest at top), then base list
    const map = new Map<number, Event>()
    for (const e of live) map.set(e.id, e)
    for (const e of base) if (!map.has(e.id)) map.set(e.id, e)
    const arr = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    // When paused, stop changing the list to avoid UI shifts
    return paused ? arr : arr
  }, [data, live, paused])

  useEffect(() => {
    if (!data) return
    const maxId = data.reduce((m, e) => Math.max(m, e.id), 0)
    lastIdRef.current = maxId
  }, [data])

  useEffect(() => {
    if (data === undefined) return
    let es: EventSource | null = null
    let cancelled = false
    const connect = () => {
      if (paused || cancelled) return
      const since = lastIdRef.current || 0
      es = new EventSource(`/api/events/stream?since=${since}`)
      es.onmessage = (msg) => {
        try {
          const e: Event = JSON.parse(msg.data)
          lastIdRef.current = Math.max(lastIdRef.current, e.id)
          setLive((prev) => {
            if (prev.find((x) => x.id === e.id)) return prev
            return [e, ...prev].slice(0, 200)
          })
          // Mark fresh for 10s to drive CSS transition
          setFreshIds((prev) => new Set(prev).add(e.id))
          setTimeout(() => {
            setFreshIds((prev) => {
              const next = new Set(prev)
              next.delete(e.id)
              return next
            })
          }, 10000)
        } catch {}
      }
      es.onerror = () => {
        if (!paused) {
          // backoff reconnect after small delay
          setTimeout(connect, 2000)
        }
        es?.close()
      }
    }
    connect()
    return () => {
      cancelled = true
      es?.close()
    }
  }, [paused, data])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Hendelseslogg</h1>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!paused}
            onChange={(e) => setPaused(!e.target.checked)}
            aria-label="Auto-oppdatering"
          />
          Auto-oppdatering
        </label>
        <div className="text-sm text-muted-foreground">{paused ? 'Av' : 'På'}</div>
      </div>
      <div className="border rounded divide-y">
        {items.map((e) => (
          <a
            key={e.id}
            href={eventHref(e)}
            className={`block p-3 hover:bg-muted transition-colors duration-[10000ms] ${freshIds.has(e.id) ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm">{e.description}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(e.createdAt).toLocaleString()}
              </div>
            </div>
          </a>
        ))}
        {!items.length ? (
          <div className="p-3 text-sm text-muted-foreground">Ingen hendelser</div>
        ) : null}
      </div>
    </div>
  )
}

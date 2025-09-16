'use client'
import useSWR from 'swr'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { NewLeadDialog } from '@/components/customers/new-lead-dialog'

type Contact = {
  id: number
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  linkedInUrl?: string | null
}
type CompanyBrief = { id: number; name: string; startDate?: string | null; endDate?: string | null }

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data, mutate } = useSWR<{
    contact: Contact
    currentCompany: CompanyBrief | null
    previousCompanies: CompanyBrief[]
    comments: Array<{ id: number; content: string; createdAt: string }>
    followups: Array<{
      id: number
      note: string
      dueAt: string
      createdBy?: { firstName?: string | null; lastName?: string | null } | null
    }>
    leads: Array<{
      id: number
      description: string
      status: 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'
    }>
    emails: Array<{ id: number; subject?: string | null; content: string; createdAt: string }>
  }>(id ? `/api/contacts/${id}` : null)
  const [newComment, setNewComment] = useState('')
  const [newFollowupNote, setNewFollowupNote] = useState('')
  const [newFollowupDue, setNewFollowupDue] = useState(() => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    const d = new Date()
    d.setDate(d.getDate() + 7)
    d.setHours(9, 0, 0, 0)
    const y = d.getFullYear()
    const m = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const hh = pad(d.getHours())
    const mm = pad(d.getMinutes())
    return `${y}-${m}-${day}T${hh}:${mm}`
  })

  if (!data) return <div className="p-6">Laster...</div>
  const { contact, currentCompany, previousCompanies, comments, followups, leads, emails } = data
  async function saveComment() {
    const body = { content: newComment, contactId: contact.id }
    const res = await fetch('/api/comments', { method: 'POST', body: JSON.stringify(body) })
    if (res.ok) {
      setNewComment('')
      mutate()
    }
  }
  async function saveFollowup() {
    const body = { note: newFollowupNote, dueAt: newFollowupDue, contactId: contact.id }
    const res = await fetch('/api/followups', { method: 'POST', body: JSON.stringify(body) })
    if (res.ok) {
      setNewFollowupNote('')
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
      const d = new Date()
      d.setDate(d.getDate() + 7)
      d.setHours(9, 0, 0, 0)
      const y = d.getFullYear()
      const m = pad(d.getMonth() + 1)
      const day = pad(d.getDate())
      const hh = pad(d.getHours())
      const mm = pad(d.getMinutes())
      setNewFollowupDue(`${y}-${m}-${day}T${hh}:${mm}`)
      mutate()
    }
  }

  const crumbs = [
    { label: 'Kunder', href: '/customers' },
    ...(currentCompany
      ? [{ label: currentCompany.name, href: `/customers/${currentCompany.id}` }]
      : []),
    { label: `${contact.firstName} ${contact.lastName}` },
  ]

  function dueBgStyle(dueAt: string): React.CSSProperties {
    const now = Date.now()
    const due = new Date(dueAt).getTime()
    const dayMs = 24 * 60 * 60 * 1000
    const diffDays = (due - now) / dayMs
    // Future beyond 2 days: no highlight
    if (diffDays >= 2) return {}
    // Within next 0-2 days: amber tint, continuous
    if (diffDays >= 0) {
      const t = 1 - Math.min(2, Math.max(0, diffDays)) / 2 // 0..1
      const lightness = 95 - 10 * t // 95% -> 85%
      return { backgroundColor: `hsl(45 95% ${lightness}%)` }
    }
    // Overdue: red tint, continuous up to 14 days past due
    const overdue = Math.min(14, -diffDays)
    const t = overdue / 14 // 0..1
    const lightness = 96 - 26 * t // 96% -> 70%
    return { backgroundColor: `hsl(0 92% ${lightness}%)` }
  }

  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumbs items={crumbs} />
      <section>
        <h1 className="text-2xl font-semibold">
          {contact.firstName} {contact.lastName}
        </h1>
        <div className="text-sm text-muted-foreground space-y-1">
          {contact.email ? <div>{contact.email}</div> : null}
          {contact.phone ? <div>{contact.phone}</div> : null}
          {contact.linkedInUrl ? (
            <a className="underline" href={contact.linkedInUrl} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Nåværende kunde</h2>
        {currentCompany ? (
          <div
            className="border rounded p-3 hover:bg-muted cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/customers/${currentCompany.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                router.push(`/customers/${currentCompany.id}`)
              }
            }}
          >
            <div className="font-medium">{currentCompany.name}</div>
            {currentCompany.startDate ? (
              <div className="text-sm text-muted-foreground">Siden {currentCompany.startDate}</div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Ingen aktiv kunde</div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Tidligere kunder</h2>
        <div className="border rounded divide-y">
          {previousCompanies.length ? (
            previousCompanies.map((co) => (
              <div
                key={`${co.id}-${co.startDate}-${co.endDate}`}
                className="p-3 hover:bg-muted cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/customers/${co.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.push(`/customers/${co.id}`)
                  }
                }}
              >
                <div className="font-medium">{co.name}</div>
                <div className="text-sm text-muted-foreground">
                  {co.startDate} - {co.endDate}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-muted-foreground">Ingen</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Kommentarer</h2>
        <div className="space-y-2">
          <textarea
            rows={3}
            className="w-full border rounded p-2 text-sm resize-y"
            placeholder="Skriv en kommentar…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="inline-flex items-center rounded bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50"
              disabled={!newComment.trim()}
              onClick={saveComment}
            >
              Lagre kommentar
            </button>
          </div>
        </div>
        <div className="border rounded divide-y mt-3">
          {comments.length ? (
            comments.map((c) => (
              <div key={c.id} className="p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
                <div className="whitespace-pre-wrap text-sm">{c.content}</div>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-muted-foreground">Ingen</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Oppfølgninger</h2>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <textarea
              rows={3}
              className="w-full border rounded p-2 text-sm resize-y"
              placeholder="Notat…"
              value={newFollowupNote}
              onChange={(e) => setNewFollowupNote(e.target.value)}
            />
          </div>
          <div className="w-48">
            <label className="block text-xs text-muted-foreground mb-1">Frist</label>
            <input
              type="datetime-local"
              className="w-full border rounded p-2 text-sm"
              value={newFollowupDue}
              onChange={(e) => setNewFollowupDue(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <button
            className="inline-flex items-center rounded bg-primary text-primary-foreground px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={!newFollowupNote.trim() || !newFollowupDue}
            onClick={saveFollowup}
          >
            Lagre oppfølgning
          </button>
        </div>
        <div className="border rounded divide-y mt-3">
          {followups.length ? (
            followups.map((f) => (
              <div key={f.id} className="p-3">
                <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                  <div className="px-1 rounded" style={dueBgStyle(f.dueAt)}>
                    Frist: {new Date(f.dueAt).toLocaleString()}{' '}
                    {f.createdBy
                      ? `· Av: ${f.createdBy.firstName ?? ''} ${f.createdBy.lastName ?? ''}`
                      : ''}
                  </div>
                  <button
                    className="inline-flex items-center rounded border px-2 py-0.5 text-xs hover:bg-muted"
                    onClick={async (e) => {
                      e.preventDefault()
                      await fetch(`/api/followups/${f.id}`, { method: 'PATCH' })
                      mutate()
                    }}
                  >
                    Utført
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-sm">{f.note}</div>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-muted-foreground">Ingen</div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Leads</h2>
          <NewLeadDialog
            companyId={currentCompany?.id}
            companyName={currentCompany?.name}
            contactId={contact.id}
            contactName={`${contact.firstName} ${contact.lastName}`}
          />
        </div>
        <div className="border rounded divide-y">
          {leads.length ? (
            leads.map((l) => (
              <a key={l.id} href={`/leads/${l.id}`} className="block p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {l.description.length > 100 ? `${l.description.slice(0, 100)}…` : l.description}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                      l.status === 'NEW'
                        ? 'bg-blue-100 text-blue-700'
                        : l.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : l.status === 'LOST'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {l.status === 'NEW'
                      ? 'Ny'
                      : l.status === 'IN_PROGRESS'
                        ? 'Under arbeid'
                        : l.status === 'LOST'
                          ? 'Tapt'
                          : 'Vunnet'}
                  </span>
                </div>
              </a>
            ))
          ) : (
            <div className="p-3 text-sm text-muted-foreground">Ingen</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">E-poster</h2>
        <div className="border rounded divide-y">
          {emails.length ? (
            emails.map((e) => (
              <div key={e.id} className="p-3">
                {e.subject ? (
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">{e.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mb-1">
                    {new Date(e.createdAt).toLocaleString()}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm">{e.content}</div>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-muted-foreground">Ingen</div>
          )}
        </div>
      </section>
    </div>
  )
}

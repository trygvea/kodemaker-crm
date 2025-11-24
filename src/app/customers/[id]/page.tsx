'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { NewContactDialog } from '@/components/customers/new-contact-dialog'
import { NewLeadDialog } from '@/components/customers/new-lead-dialog'
import { Pencil } from 'lucide-react'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'
import { CreatedBy } from '@/components/created-by'

import type { GetCompanyDetailResponse } from '@/types/api'

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data, mutate } = useSWR<GetCompanyDetailResponse>(id ? `/api/companies/${id}` : null)

  // Ensure hooks run consistently on every render
  const leadsList = useMemo(() => data?.leads ?? [], [data])
  const leadCounts = useMemo(() => {
    const c = { NEW: 0, IN_PROGRESS: 0, LOST: 0, WON: 0 } as Record<
      'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON',
      number
    >
    for (const l of leadsList) {
      if (l.status && c[l.status as 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'] !== undefined) {
        c[l.status as 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'] += 1
      }
    }
    return c
  }, [leadsList])

  const contactLeadCounts = useMemo(() => {
    const map: Record<number, { NEW: number; IN_PROGRESS: number; LOST: number; WON: number }> = {}
    for (const l of leadsList) {
      const cid = l.contactId as number | null | undefined
      const status = l.status as 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON' | undefined
      if (!cid || !status) continue
      if (!map[cid]) map[cid] = { NEW: 0, IN_PROGRESS: 0, LOST: 0, WON: 0 }
      if (map[cid][status] !== undefined) map[cid][status] += 1
    }
    return map
  }, [leadsList])
  const [newComment, setNewComment] = useState('')

  if (!data) return <div className="p-6">Laster...</div>
  const { company, contacts, comments, leads } = data
  async function saveComment() {
    const body = { content: newComment, companyId: company.id }
    const res = await fetch('/api/comments', { method: 'POST', body: JSON.stringify(body) })
    if (res.ok) {
      setNewComment('')
      mutate()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumbs
        items={[{ label: 'Organisasjoner', href: '/customers' }, { label: company.name }]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <div className="text-sm text-muted-foreground">
            {company.websiteUrl ? (
              <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="underline">
                {company.websiteUrl}
              </a>
            ) : null}
            {company.emailDomain ? <div>@{company.emailDomain}</div> : null}
            {company.contactEmail ? <div>{company.contactEmail}</div> : null}
          </div>
        </div>
        <a
          href={`/customers/${company.id}/edit`}
          className="inline-flex items-center rounded bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90"
        >
          <Pencil className="h-4 w-4 mr-1.5" />
          Endre
        </a>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Kontakter</h2>
          <NewContactDialog companyId={company.id} companyName={company.name} />
        </div>
        <div className="border rounded divide-y">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-3 flex items-center justify-between hover:bg-muted cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/contacts/${c.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  router.push(`/contacts/${c.id}`)
                }
              }}
            >
              <div>
                <div className="font-medium">
                  {c.firstName} {c.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{c.emails.join('; ')}</div>
              </div>
              <div
                className="space-x-2 flex items-center"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {contactLeadCounts[c.id] ? (
                  <div className="flex items-center gap-1 mr-2">
                    {contactLeadCounts[c.id].NEW > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                        Ny {contactLeadCounts[c.id].NEW}
                      </span>
                    ) : null}
                    {contactLeadCounts[c.id].IN_PROGRESS > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">
                        Under arbeid {contactLeadCounts[c.id].IN_PROGRESS}
                      </span>
                    ) : null}
                    {contactLeadCounts[c.id].LOST > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">
                        Tapt {contactLeadCounts[c.id].LOST}
                      </span>
                    ) : null}
                    {contactLeadCounts[c.id].WON > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                        Vunnet {contactLeadCounts[c.id].WON}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <NewLeadDialog
                  companyId={company.id}
                  companyName={company.name}
                  contactId={c.id}
                  contactName={`${c.firstName} ${c.lastName}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Kommentarer</h2>
        </div>
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Leads</h2>
          <NewLeadDialog companyId={company.id} companyName={company.name} />
        </div>
        <div className="flex items-center gap-1 mb-2">
          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
            Ny {leadCounts.NEW}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">
            Under arbeid {leadCounts.IN_PROGRESS}
          </span>
          <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">
            Tapt {leadCounts.LOST}
          </span>
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
            Vunnet {leadCounts.WON}
          </span>
        </div>
        <div className="border rounded divide-y">
          {leads.map((l) => (
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
          ))}
        </div>
      </section>
      <CreatedBy createdAt={company.createdAt} createdBy={data.createdBy} />
    </div>
  )
}

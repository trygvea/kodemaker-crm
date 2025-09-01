"use client"
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
// import { NewContactDialog } from '@/components/customers/new-contact-dialog'
import { NewLeadDialog } from '@/components/customers/new-lead-dialog'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'

type Company = {
  id: number
  name: string
  websiteUrl?: string | null
  emailDomain?: string | null
  contactEmail?: string | null
}

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data } = useSWR<{ company: Company; contacts: Array<{ id: number; firstName: string; lastName: string; email?: string | null }>; leads: Array<{ id: number; status: 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'; description: string; contactId?: number | null }> }>(id ? `/api/companies/${id}` : null)

  // Ensure hooks run consistently on every render
  const leadsList = useMemo(() => data?.leads ?? [], [data])
  const leadCounts = useMemo(() => {
    const c = { NEW: 0, IN_PROGRESS: 0, LOST: 0, WON: 0 } as Record<'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON', number>
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

  if (!data) return <div className="p-6">Laster...</div>
  const { company, contacts, leads } = data

  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumbs items={[{ label: 'Kundeliste', href: '/customers' }, { label: company.name }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <div className="text-sm text-muted-foreground">
            {company.websiteUrl ? (
              <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="underline">
                {company.websiteUrl}
              </a>
            ) : null}
            {company.contactEmail ? <div>{company.contactEmail}</div> : null}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Kontakter</h2>
        </div>
        <div className="border rounded divide-y">
          {contacts.map((c) => (
            <div key={c.id} className="p-3 flex items-center justify-between">
              <div>
                <a href={`/contacts/${c.id}`} className="font-medium underline-offset-4 hover:underline">{c.firstName} {c.lastName}</a>
                <div className="text-sm text-muted-foreground">{c.email}</div>
              </div>
              <div className="space-x-2 flex items-center">
                {contactLeadCounts[c.id] ? (
                  <div className="flex items-center gap-1 mr-2">
                    {contactLeadCounts[c.id].NEW > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">Ny {contactLeadCounts[c.id].NEW}</span>
                    ) : null}
                    {contactLeadCounts[c.id].IN_PROGRESS > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">Under arbeid {contactLeadCounts[c.id].IN_PROGRESS}</span>
                    ) : null}
                    {contactLeadCounts[c.id].LOST > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">Tapt {contactLeadCounts[c.id].LOST}</span>
                    ) : null}
                    {contactLeadCounts[c.id].WON > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">Vunnet {contactLeadCounts[c.id].WON}</span>
                    ) : null}
                  </div>
                ) : null}
                <NewLeadDialog companyId={company.id} companyName={company.name} contactId={c.id} contactName={`${c.firstName} ${c.lastName}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Leads</h2>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">Ny {leadCounts.NEW}</span>
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">Under arbeid {leadCounts.IN_PROGRESS}</span>
          <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">Tapt {leadCounts.LOST}</span>
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">Vunnet {leadCounts.WON}</span>
        </div>
        <div className="border rounded divide-y">
          {leads.map((l) => (
            <a key={l.id} href={`/leads/${l.id}`} className="block p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {l.description.length > 100 ? `${l.description.slice(0, 100)}…` : l.description}
                </div>
                <div className="text-sm text-muted-foreground">{l.status}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}



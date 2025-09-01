"use client"
import useSWR from 'swr'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'
import { useParams } from 'next/navigation'

type Contact = { id: number; firstName: string; lastName: string; email?: string | null; phone?: string | null; linkedInUrl?: string | null }
type CompanyBrief = { id: number; name: string; startDate?: string | null; endDate?: string | null }

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data } = useSWR<{ contact: Contact; currentCompany: CompanyBrief | null; previousCompanies: CompanyBrief[]; leads: Array<{ id: number; description: string; status: 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON' }> }>(id ? `/api/contacts/${id}` : null)

  if (!data) return <div className="p-6">Laster...</div>
  const { contact, currentCompany, previousCompanies, leads } = data

  const crumbs = [
    { label: 'Kundeliste', href: '/customers' },
    ...(currentCompany ? [{ label: currentCompany.name, href: `/customers/${currentCompany.id}` }] : []),
    { label: `${contact.firstName} ${contact.lastName}` },
  ]

  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumbs items={crumbs} />
      <section>
        <h1 className="text-2xl font-semibold">{contact.firstName} {contact.lastName}</h1>
        <div className="text-sm text-muted-foreground space-y-1">
          {contact.email ? <div>{contact.email}</div> : null}
          {contact.phone ? <div>{contact.phone}</div> : null}
          {contact.linkedInUrl ? <a className="underline" href={contact.linkedInUrl} target="_blank" rel="noreferrer">LinkedIn</a> : null}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Nåværende kunde</h2>
        {currentCompany ? (
          <div className="border rounded p-3">
            <a className="font-medium underline" href={`/customers/${currentCompany.id}`}>{currentCompany.name}</a>
            {currentCompany.startDate ? <div className="text-sm text-muted-foreground">Siden {currentCompany.startDate}</div> : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Ingen aktiv kunde</div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Tidligere kunder</h2>
        <div className="border rounded divide-y">
          {previousCompanies.length ? previousCompanies.map((co) => (
            <div key={`${co.id}-${co.startDate}-${co.endDate}`} className="p-3">
              <a className="font-medium underline" href={`/customers/${co.id}`}>{co.name}</a>
              <div className="text-sm text-muted-foreground">{co.startDate} - {co.endDate}</div>
            </div>
          )) : (
            <div className="p-3 text-sm text-muted-foreground">Ingen</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Leads</h2>
        <div className="border rounded divide-y">
          {leads.length ? leads.map((l) => (
            <a key={l.id} href={`/leads/${l.id}`} className="block p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {l.description.length > 100 ? `${l.description.slice(0, 100)}…` : l.description}
                </div>
                <div className="text-sm text-muted-foreground">{l.status}</div>
              </div>
            </a>
          )) : (
            <div className="p-3 text-sm text-muted-foreground">Ingen</div>
          )}
        </div>
      </section>
    </div>
  )
}



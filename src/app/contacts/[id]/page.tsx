'use client'
import useSWR from 'swr'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'
import { useParams, useRouter } from 'next/navigation'

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
  const { data } = useSWR<{
    contact: Contact
    currentCompany: CompanyBrief | null
    previousCompanies: CompanyBrief[]
    leads: Array<{
      id: number
      description: string
      status: 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'
    }>
    emails: Array<{ id: number; subject?: string | null; content: string; createdAt: string }>
  }>(id ? `/api/contacts/${id}` : null)

  if (!data) return <div className="p-6">Laster...</div>
  const { contact, currentCompany, previousCompanies, leads, emails } = data

  const crumbs = [
    { label: 'Kundeliste', href: '/customers' },
    ...(currentCompany
      ? [{ label: currentCompany.name, href: `/customers/${currentCompany.id}` }]
      : []),
    { label: `${contact.firstName} ${contact.lastName}` },
  ]

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
        <h2 className="text-lg font-medium mb-2">Leads</h2>
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

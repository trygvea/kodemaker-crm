"use client"
import useSWR from 'swr'
import { useParams } from 'next/navigation'
import { NewContactDialog } from '@/components/customers/new-contact-dialog'
import { NewLeadDialog } from '@/components/customers/new-lead-dialog'

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
  const { data } = useSWR<{ company: Company; contacts: any[]; leads: any[] }>(id ? `/api/companies/${id}` : null)

  if (!data) return <div className="p-6">Laster...</div>
  const { company, contacts, leads } = data

  return (
    <div className="p-6 space-y-6">
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
                <div className="font-medium">{c.firstName} {c.lastName}</div>
                <div className="text-sm text-muted-foreground">{c.email}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Leads</h2>
        </div>
        <div className="border rounded divide-y">
          {leads.map((l) => (
            <div key={l.id} className="p-3 flex items-center justify-between">
              <div className="font-medium">{l.description}</div>
              <div className="text-sm text-muted-foreground">{l.status}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}



'use client'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'
import { Save, X, Trash2 } from 'lucide-react'

type Company = {
  id: number
  name: string
  websiteUrl?: string | null
  emailDomain?: string | null
  contactEmail?: string | null
}

export default function EditCompanyPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data, mutate } = useSWR<{ company: Company }>(id ? `/api/companies/${id}` : null)
  const company = data?.company
  const [name, setName] = useState(company?.name || '')
  const [websiteUrl, setWebsiteUrl] = useState(company?.websiteUrl || '')
  const [emailDomain, setEmailDomain] = useState(company?.emailDomain || '')
  const [contactEmail, setContactEmail] = useState(company?.contactEmail || '')

  useEffect(() => {
    if (!company) return
    setName(company.name || '')
    setWebsiteUrl(company.websiteUrl || '')
    setEmailDomain(company.emailDomain || '')
    setContactEmail(company.contactEmail || '')
  }, [company])

  async function save() {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, websiteUrl, emailDomain, contactEmail }),
    })
    if (!res.ok) return
    await mutate()
    router.push(`/customers/${id}`)
  }

  if (!company) return <div className="p-6">Laster…</div>

  return (
    <div className="p-6 space-y-4">
      <PageBreadcrumbs
        items={[
          { label: 'Kunder', href: '/customers' },
          { label: company.name, href: `/customers/${company.id}` },
          { label: 'Endre' },
        ]}
      />
      <div className="grid gap-3 max-w-xl">
        <div>
          <label className="block text-sm mb-1">Navn</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Website</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={websiteUrl ?? ''}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">E-postdomene</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={emailDomain ?? ''}
            onChange={(e) => setEmailDomain(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Kontakt-epost</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={contactEmail ?? ''}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div className="flex justify-between gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1.5"
            onClick={async () => {
              if (!confirm('Slette kunde? Dette kan ikke angres.')) return
              const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
              if (res.ok) {
                router.push('/customers')
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Slett
          </button>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-sm border rounded inline-flex items-center gap-1.5"
              onClick={() => router.push(`/customers/${id}`)}
            >
              <X className="h-4 w-4" /> Avbryt
            </button>
            <button
              className="px-3 py-1.5 text-sm rounded bg-primary text-primary-foreground inline-flex items-center gap-1.5"
              onClick={save}
            >
              <Save className="h-4 w-4" /> Lagre
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

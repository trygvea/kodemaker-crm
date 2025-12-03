'use client'
import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { NewLeadDialog } from '@/components/customers/new-lead-dialog'
import { NewContactDialog } from '@/components/customers/new-contact-dialog'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type Company = {
  id: number
  name: string
  websiteUrl?: string | null
  emailDomain?: string | null
  contactEmail?: string | null
  leadCounts?: { NEW: number; IN_PROGRESS: number; LOST: number; WON: number; BORTFALT: number }
}

const companySchema = z.object({
  name: z.string().min(1, 'Skriv navn'),
  websiteUrl: z.string().url('Ugyldig URL').optional().or(z.literal('')),
  emailDomain: z.string().optional(),
  contactEmail: z.string().email('Ugyldig epost').optional(),
})

export default function CustomersPage() {
  const { data, mutate } = useSWR<Company[]>(`/api/companies`)
  const [search, setSearch] = useState('')
  const filtered = useMemo(
    () => (data || []).filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  )
  const router = useRouter()

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', websiteUrl: '', emailDomain: '', contactEmail: '' },
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onSubmit(values: z.infer<typeof companySchema>) {
    const res = await fetch('/api/companies', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) {
      toast.error('Kunne ikke opprette organisasjon')
      return
    }
    toast.success('Organisasjon opprettet')
    form.reset()
    mutate()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Organisasjoner</h1>
      <div className="flex gap-2 items-center justify-between">
        <Input
          autoFocus
          className="max-w-sm"
          placeholder="Søk i organisasjoner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="divide-y border rounded">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30"
            onClick={() => router.push(`/customers/${c.id}`)}
            role="button"
          >
            <div>
              <div className="font-medium">{c.name}</div>
              {c.websiteUrl ? (
                <a
                  className="block text-sm text-muted-foreground"
                  href={c.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {c.websiteUrl}
                </a>
              ) : null}
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {c.leadCounts ? (
                <div className="flex items-center gap-1 mr-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                    Ny {c.leadCounts.NEW}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">
                    Under arbeid {c.leadCounts.IN_PROGRESS}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">
                    Tapt {c.leadCounts.LOST}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                    Vunnet {c.leadCounts.WON}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                    Bortfalt {c.leadCounts.BORTFALT}
                  </span>
                </div>
              ) : null}
              <NewContactDialog companyId={c.id} companyName={c.name} />
              <NewLeadDialog companyId={c.id} companyName={c.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

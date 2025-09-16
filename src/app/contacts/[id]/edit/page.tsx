'use client'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'

type Contact = {
  id: number
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  linkedInUrl?: string | null
}

export default function EditContactPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data, mutate } = useSWR<{
    contact: Contact
    history: Array<{
      id: number
      startDate: string
      endDate?: string | null
      company: { id: number; name: string }
    }>
  }>(id ? `/api/contacts/${id}` : null)
  const contact = data?.contact
  const history = data?.history || []
  type Company = { id: number; name: string; emailDomain?: string | null }
  const [open, setOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const { data: companyOptions } = useSWR<Company[]>(
    companyQuery ? `/api/companies?q=${encodeURIComponent(companyQuery)}` : null
  )
  const [firstName, setFirstName] = useState(contact?.firstName || '')
  const [lastName, setLastName] = useState(contact?.lastName || '')
  const [email, setEmail] = useState(contact?.email || '')
  const [phone, setPhone] = useState(contact?.phone || '')
  const [linkedInUrl, setLinkedInUrl] = useState(contact?.linkedInUrl || '')

  // Re-sync local state when data loads
  useEffect(() => {
    if (!contact) return
    setFirstName(contact.firstName || '')
    setLastName(contact.lastName || '')
    setEmail(contact.email || '')
    setPhone(contact.phone || '')
    setLinkedInUrl(contact.linkedInUrl || '')
  }, [contact])

  async function save() {
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ firstName, lastName, email, phone, linkedInUrl }),
    })
    if (!res.ok) return
    await mutate()
    router.push(`/contacts/${id}`)
  }

  if (!contact) return <div className="p-6">Laster…</div>

  return (
    <div className="p-6 space-y-4">
      <PageBreadcrumbs
        items={[
          { label: 'Kontakter', href: '/contacts' },
          { label: `${contact.firstName} ${contact.lastName}`, href: `/contacts/${id}` },
          { label: 'Endre' },
        ]}
      />
      <div className="grid gap-3 max-w-xl">
        <div>
          <label className="block text-sm mb-1">Fornavn</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Etternavn</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">E-post</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={email ?? ''}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Telefon</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={phone ?? ''}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">LinkedIn</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={linkedInUrl ?? ''}
            onChange={(e) => setLinkedInUrl(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 text-sm border rounded"
            onClick={() => router.push(`/contacts/${id}`)}
          >
            Avbryt
          </button>
          <button
            className="px-3 py-1.5 text-sm rounded bg-primary text-primary-foreground"
            onClick={save}
          >
            Lagre
          </button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">Endring av firmatilknytninger kommer her.</div>
      <section className="space-y-2">
        <h3 className="text-sm font-medium">Firmatilknytninger</h3>
        <div className="border rounded divide-y">
          {history.length ? (
            history.map((h) => (
              <div key={h.id} className="p-3 grid grid-cols-5 gap-2 items-end">
                <div className="col-span-2">
                  <div className="font-medium">{h.company.name}</div>
                </div>
                <div>
                  <label className="block text-xs mb-1">Start</label>
                  <input
                    className="w-full border rounded p-2 text-sm"
                    defaultValue={h.startDate}
                    onBlur={async (e) => {
                      const v = e.currentTarget.value
                      if (v && v !== h.startDate) {
                        await fetch(`/api/contact-company-history/${h.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ startDate: v }),
                        })
                        mutate()
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Slutt</label>
                  <input
                    className="w-full border rounded p-2 text-sm"
                    defaultValue={h.endDate || ''}
                    placeholder="pågående"
                    onBlur={async (e) => {
                      const v = e.currentTarget.value
                      await fetch(`/api/contact-company-history/${h.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ endDate: v }),
                      })
                      mutate()
                    }}
                  />
                </div>
                <div className="text-right">
                  {!h.endDate || h.endDate === '' ? (
                    <button
                      className="px-2 py-1 text-xs border rounded"
                      onClick={async () => {
                        const today = new Date().toISOString().slice(0, 10)
                        await fetch(`/api/contact-company-history/${h.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ endDate: today }),
                        })
                        mutate()
                      }}
                    >
                      Avslutt i dag
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-muted-foreground">Ingen tilknytninger</div>
          )}
        </div>
        <div className="grid grid-cols-5 gap-2 items-end mt-3">
          <div className="col-span-2">
            <label className="block text-xs mb-1">Firma</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-between w-full"
                  onKeyDown={(e) => {
                    if (open) return
                    if (e.metaKey || e.ctrlKey || e.altKey) return
                    if (e.key.length === 1) {
                      setOpen(true)
                      setCompanyQuery(e.key)
                    } else if (e.key === 'Backspace' || e.key === 'Delete') {
                      setOpen(true)
                      setCompanyQuery('')
                    }
                  }}
                >
                  {selectedCompany?.name || 'Velg firma'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput
                    autoFocus
                    placeholder="Søk etter firma..."
                    value={companyQuery}
                    onValueChange={setCompanyQuery}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' || e.key === 'Tab') {
                        setOpen(false)
                      }
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>Ingen treff</CommandEmpty>
                    {companyOptions?.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={c.name}
                        onSelect={() => {
                          setSelectedCompany({ id: c.id, name: c.name })
                          setOpen(false)
                        }}
                      >
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-xs mb-1">Start</label>
            <input
              id="newStartDate"
              className="w-full border rounded p-2 text-sm"
              placeholder="startdato"
              type="date"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Slutt</label>
            <input
              id="newEndDate"
              className="w-full border rounded p-2 text-sm"
              placeholder="(valgfri) sluttdato"
              type="date"
            />
          </div>
          <div className="text-right">
            <button
              className="px-3 py-1.5 text-sm rounded bg-primary text-primary-foreground"
              onClick={async () => {
                const companyId = selectedCompany?.id
                const startDate = (document.getElementById('newStartDate') as HTMLInputElement)
                  .value
                const endDate = (document.getElementById('newEndDate') as HTMLInputElement).value
                if (!companyId || !startDate) return
                await fetch('/api/contact-company-history', {
                  method: 'POST',
                  body: JSON.stringify({ contactId: id, companyId, startDate, endDate }),
                })
                setSelectedCompany(null)
                ;(document.getElementById('newStartDate') as HTMLInputElement).value = ''
                ;(document.getElementById('newEndDate') as HTMLInputElement).value = ''
                mutate()
              }}
            >
              Legg til
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

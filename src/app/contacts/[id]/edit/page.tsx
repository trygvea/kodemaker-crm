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
import { Save, X, Trash2, Plus, Edit2, Check, GitMerge } from 'lucide-react'
import { MergeContactsDialog } from '@/components/merge-contacts-dialog'

type Contact = {
  id: number
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  linkedInUrl?: string | null
}

type ContactEmail = {
  id: number
  email: string
  active: boolean
  createdAt: string
}

export default function EditContactPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const { data, mutate } = useSWR<{
    contact: Contact
    contactEmails: ContactEmail[]
    history: Array<{
      id: number
      startDate: string
      endDate?: string | null
      company: { id: number; name: string }
    }>
  }>(id ? `/api/contacts/${id}` : null)
  const contact = data?.contact
  const contactEmails = data?.contactEmails || []
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
  const [phone, setPhone] = useState(contact?.phone || '')
  const [linkedInUrl, setLinkedInUrl] = useState(contact?.linkedInUrl || '')
  
  // Email management state
  const [emails, setEmails] = useState<ContactEmail[]>([])
  const [newEmailAddress, setNewEmailAddress] = useState('')
  const [editingEmailId, setEditingEmailId] = useState<number | null>(null)
  const [editingEmailAddress, setEditingEmailAddress] = useState('')

  // Merge dialog state
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const { data: contactCounts } = useSWR<{
    emailAddresses: number
    emails: number
    leads: number
    comments: number
    events: number
    followups: number
  }>(id ? `/api/contacts/${id}/counts` : null)

  // Re-sync local state when data loads
  useEffect(() => {
    if (!contact) return
    setFirstName(contact.firstName || '')
    setLastName(contact.lastName || '')
    setPhone(contact.phone || '')
    setLinkedInUrl(contact.linkedInUrl || '')
  }, [contact])

  useEffect(() => {
    setEmails(contactEmails)
  }, [contactEmails])

  async function save() {
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ firstName, lastName, phone, linkedInUrl }),
    })
    if (!res.ok) return
    await mutate()
    router.push(`/contacts/${id}`)
  }

  async function addEmail() {
    if (!newEmailAddress.trim()) return
    
    const res = await fetch(`/api/contacts/${id}/emails`, {
      method: 'POST',
      body: JSON.stringify({ email: newEmailAddress.trim(), active: true }),
    })
    
    if (res.ok) {
      setNewEmailAddress('')
      await mutate()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to add email')
    }
  }

  async function updateEmail(emailId: number, email: string, active: boolean) {
    const res = await fetch(`/api/contacts/${id}/emails/${emailId}`, {
      method: 'PATCH',
      body: JSON.stringify({ email, active }),
    })
    
    if (res.ok) {
      setEditingEmailId(null)
      setEditingEmailAddress('')
      await mutate()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to update email')
    }
  }

  async function deleteEmail(emailId: number) {
    if (!confirm('Delete this email address?')) return
    
    const res = await fetch(`/api/contacts/${id}/emails/${emailId}`, {
      method: 'DELETE',
    })
    
    if (res.ok) {
      await mutate()
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to delete email')
    }
  }

  async function handleMerge(mergeData: {
    targetContactId: number
    mergeEmailAddresses: boolean
    mergeEmails: boolean
    mergeLeads: boolean
    mergeComments: boolean
    mergeEvents: boolean
    mergeFollowups: boolean
    deleteSourceContact: boolean
  }) {
    const res = await fetch(`/api/contacts/${id}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mergeData),
    })

    if (res.ok) {
      const result = await res.json()
      alert(result.message || 'Merge completed successfully')
      
      if (mergeData.deleteSourceContact) {
        // If source contact was deleted, redirect to contacts list
        router.push('/contacts')
      } else {
        // Otherwise redirect to the contact view page
        router.push(`/contacts/${id}`)
      }
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to merge contacts')
      throw new Error(error.error || 'Failed to merge contacts')
    }
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
          <label className="block text-sm mb-1">E-postadresser</label>
          <div className="space-y-2">
            {emails.map((emailItem) => (
              <div key={emailItem.id} className="flex items-center gap-2 p-2 border rounded">
                {editingEmailId === emailItem.id ? (
                  <>
                    <input
                      className="flex-1 border rounded p-1 text-sm"
                      value={editingEmailAddress}
                      onChange={(e) => setEditingEmailAddress(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateEmail(emailItem.id, editingEmailAddress, emailItem.active)
                        } else if (e.key === 'Escape') {
                          setEditingEmailId(null)
                          setEditingEmailAddress('')
                        }
                      }}
                      autoFocus
                    />
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={emailItem.active}
                        onChange={(e) =>
                          updateEmail(emailItem.id, editingEmailAddress, e.target.checked)
                        }
                        className="mr-1"
                      />
                      Aktiv
                    </label>
                    <button
                      onClick={() => updateEmail(emailItem.id, editingEmailAddress, emailItem.active)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingEmailId(null)
                        setEditingEmailAddress('')
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{emailItem.email}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      emailItem.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {emailItem.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                    <button
                      onClick={() => {
                        setEditingEmailId(emailItem.id)
                        setEditingEmailAddress(emailItem.email)
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        await updateEmail(emailItem.id, emailItem.email, !emailItem.active)
                      }}
                      className={`text-sm px-2 py-1 rounded ${
                        emailItem.active
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-200 text-green-700 hover:bg-green-300'
                      }`}
                    >
                      {emailItem.active ? 'Deaktiver' : 'Aktiver'}
                    </button>
                    <button
                      onClick={() => deleteEmail(emailItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                className="flex-1 border rounded p-2 text-sm"
                placeholder="Legg til ny e-postadresse..."
                value={newEmailAddress}
                onChange={(e) => setNewEmailAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addEmail()
                  }
                }}
              />
              <button
                onClick={addEmail}
                className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Legg til
              </button>
            </div>
          </div>
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
        <div className="flex justify-between gap-2">
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-1.5"
              onClick={async () => {
                if (!confirm('Slette kontakt? Dette kan ikke angres.')) return
                const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
                if (res.ok) {
                  router.push('/contacts')
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Slett
            </button>
            <button
              className="px-3 py-1.5 text-sm rounded bg-orange-600 text-white hover:bg-orange-700 inline-flex items-center gap-1.5"
              onClick={() => setMergeDialogOpen(true)}
            >
              <GitMerge className="h-4 w-4" /> Merge inn i...
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-sm border rounded inline-flex items-center gap-1.5"
              onClick={() => router.push(`/contacts/${id}`)}
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

      {/* Merge Contacts Dialog */}
      {contact && contactCounts && (
        <MergeContactsDialog
          open={mergeDialogOpen}
          onOpenChange={setMergeDialogOpen}
          sourceContact={{
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
          }}
          contactCounts={contactCounts}
          onMerge={handleMerge}
        />
      )}

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

"use client"
import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { NewLeadDialog } from '@/components/customers/new-lead-dialog'
import { NewContactDialog as NewContactDialogComponent } from '@/components/customers/new-contact-dialog'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'

type Company = {
  id: number
  name: string
  websiteUrl?: string | null
  emailDomain?: string | null
  contactEmail?: string | null
  leadCounts?: { NEW: number; IN_PROGRESS: number; LOST: number; WON: number }
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

  async function onSubmit(values: z.infer<typeof companySchema>) {
    const res = await fetch('/api/companies', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) {
      toast.error('Kunne ikke opprette kunde')
      return
    }
    toast.success('Kunde opprettet')
    form.reset()
    mutate()
  }

  return (
    <div className="p-6 space-y-4">
      <PageBreadcrumbs items={[{ label: 'Kundeliste' }]} />
      <div className="flex gap-2 items-center justify-between">
        <Input className="max-w-sm" placeholder="Søk i kunder" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <div className="font-medium">
                {c.name}
              </div>
              {c.websiteUrl ? (
                <a className="block text-sm text-muted-foreground" href={c.websiteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  {c.websiteUrl}
                </a>
              ) : null}
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {c.leadCounts ? (
                <div className="flex items-center gap-1 mr-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">Ny {c.leadCounts.NEW}</span>
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">Under arbeid {c.leadCounts.IN_PROGRESS}</span>
                  <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">Tapt {c.leadCounts.LOST}</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">Vunnet {c.leadCounts.WON}</span>
                </div>
              ) : null}
              <NewContactDialogComponent companyId={c.id} companyName={c.name} />
              <NewLeadDialog companyId={c.id} companyName={c.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NewCompanyDialog({
  form,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof companySchema>>>;
  onSubmit: (values: z.infer<typeof companySchema>) => Promise<void>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Ny kunde</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny kunde</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn</FormLabel>
                  <FormControl>
                    <Input placeholder="Firmanavn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webadresse</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post-domene</FormLabel>
                  <FormControl>
                    <Input placeholder="example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontakt-epost</FormLabel>
                  <FormControl>
                    <Input placeholder="kontakt@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Lagre</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function NewContactDialog({ companyId, companyName }: { companyId?: number; companyName?: string }) {
  const schema = z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      linkedInUrl: z.string().url().optional().or(z.literal('')),
      companyId: z.number().optional(),
      startDate: z.string().optional(),
    })
    .refine((data) => !(data.companyId && !data.startDate), {
      path: ['startDate'],
      message: 'Startdato kreves når kunde er valgt',
    })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', linkedInUrl: '', companyId, startDate: companyId ? new Date().toISOString().slice(0, 10) : undefined },
  })
  const [open, setOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<{ id: number; name: string } | null>(null)
  const { data: companyOptions } = useSWR<Company[]>(companyQuery ? `/api/companies?q=${encodeURIComponent(companyQuery)}` : null)

  useEffect(() => {
    if (companyId) {
      setSelectedCompany({ id: companyId, name: companyName || '' })
      form.setValue('companyId', companyId)
      form.setValue('startDate', new Date().toISOString().slice(0, 10))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])
  async function onSubmit(values: z.infer<typeof schema>) {
    const res = await fetch('/api/contacts', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) return toast.error('Kunne ikke opprette kontakt')
    toast.success('Kontakt opprettet')
    form.reset()
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Ny kontakt</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny kontakt</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem>
                <FormLabel>Fornavn</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem>
                <FormLabel>Etternavn</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              control={form.control}
              name="companyId"
              render={() => (
                <FormItem>
                  <FormLabel>Kunde</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="justify-between w-full">
                        {selectedCompany?.name || 'Velg kunde'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="Søk etter kunde..." value={companyQuery} onValueChange={setCompanyQuery} />
                        <CommandList>
                          <CommandEmpty>Ingen treff</CommandEmpty>
                          {companyOptions?.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.name}
                              onSelect={() => {
                                setSelectedCompany({ id: c.id, name: c.name })
                                form.setValue('companyId', c.id)
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Ansatt dato</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Epost</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="linkedInUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Startdato</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="col-span-2 flex justify-end">
              <Button type="submit">Lagre</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// moved to components



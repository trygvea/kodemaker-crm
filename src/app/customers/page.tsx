"use client"
import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

type Company = {
  id: number
  name: string
  websiteUrl?: string | null
  emailDomain?: string | null
  contactEmail?: string | null
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kunder</h1>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Input className="max-w-sm" placeholder="Søk i kunder" value={search} onChange={(e) => setSearch(e.target.value)} />
        <NewCompanyDialog form={form} onSubmit={onSubmit} />
      </div>
      <div className="divide-y border rounded">
        {filtered.map((c) => (
          <div key={c.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              {c.websiteUrl ? (
                <a className="text-sm text-muted-foreground" href={c.websiteUrl} target="_blank" rel="noreferrer">
                  {c.websiteUrl}
                </a>
              ) : null}
            </div>
            <div className="space-x-2">
              <NewContactDialog companyId={c.id} />
              <NewLeadDialog companyId={c.id} />
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

function NewContactDialog({ companyId }: { companyId: number }) {
  const schema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    linkedInUrl: z.string().url().optional(),
    companyId: z.number(),
    startDate: z.string(),
  })
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', linkedInUrl: '', companyId, startDate: new Date().toISOString().slice(0, 10) },
  })
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

function NewLeadDialog({ companyId }: { companyId: number }) {
  const schema = z.object({ description: z.string().min(1), companyId: z.number() })
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { description: '', companyId } })
  async function onSubmit(values: z.infer<typeof schema>) {
    const res = await fetch('/api/leads', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) return toast.error('Kunne ikke opprette lead')
    toast.success('Lead opprettet')
    form.reset()
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Nytt lead</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nytt lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Beskrivelse</FormLabel>
                <FormControl><Input placeholder="Kort beskrivelse" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end">
              <Button type="submit">Lagre</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}



"use client"
import useSWR, { useSWRConfig } from 'swr'
import { useEffect, useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type Company = { id: number; name: string }
type Contact = { id: number; firstName: string; lastName: string }

export function NewLeadDialog({ companyId, companyName, contactId, contactName, trigger }: { companyId?: number; companyName?: string; contactId?: number; contactName?: string; trigger?: ReactNode }) {
  const schema = z
    .object({
      description: z.string().min(1),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
    })
    .refine((d) => !!(d.companyId || d.contactId), { message: 'Velg kunde eller kontakt', path: ['companyId'] })

  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { description: '', companyId } })

  const [open, setOpen] = useState(false)
  const [cOpen, setCOpen] = useState(false)
  const [kOpen, setKOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [contactQuery, setContactQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const { data: companies } = useSWR<Company[]>(companyQuery ? `/api/companies?q=${encodeURIComponent(companyQuery)}` : null)
  const { data: contacts } = useSWR<Contact[]>(contactQuery ? `/api/contacts?q=${encodeURIComponent(contactQuery)}` : null)
  const { mutate: globalMutate } = useSWRConfig()

  useEffect(() => {
    if (companyId) {
      form.setValue('companyId', companyId)
      setSelectedCompany({ id: companyId, name: companyName || '' })
    } else {
      form.setValue('companyId', undefined)
      setSelectedCompany(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, companyName])

  useEffect(() => {
    if (contactId) {
      form.setValue('contactId', contactId)
      setSelectedContact({ id: contactId, firstName: contactName?.split(' ')?.[0] || '', lastName: contactName?.split(' ').slice(1).join(' ') || '' })
    } else {
      form.setValue('contactId', undefined)
      setSelectedContact(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId, contactName])

  async function onSubmit(values: z.infer<typeof schema>) {
    const res = await fetch('/api/leads', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) return toast.error('Kunne ikke opprette lead')
    toast.success('Lead opprettet')
    // Refresh relevant lists so the new lead appears immediately
    const refreshCompanyId = selectedCompany?.id ?? companyId
    const refreshContactId = selectedContact?.id ?? contactId
    await Promise.all([
      globalMutate('/api/companies'),
      refreshCompanyId ? globalMutate(`/api/companies/${refreshCompanyId}`) : Promise.resolve(),
      refreshContactId ? globalMutate(`/api/contacts/${refreshContactId}`) : Promise.resolve(),
    ])
    setOpen(false)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="secondary">Ny lead</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ny lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Beskrivelse</FormLabel>
                <FormControl>
                  <Textarea rows={5} className="resize-none max-h-[40vh] overflow-auto" placeholder="Kort beskrivelse" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="companyId" render={() => (
                <FormItem>
                  <FormLabel>Kunde</FormLabel>
                  <Popover open={cOpen} onOpenChange={setCOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="justify-between w-full">
                        {selectedCompany?.name || companyName || 'Velg kunde'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="Søk kunde..." value={companyQuery} onValueChange={setCompanyQuery} />
                        <CommandList>
                          <CommandEmpty>Ingen treff</CommandEmpty>
                          {companies?.map((c) => (
                            <CommandItem key={c.id} value={c.name} onSelect={() => { setSelectedCompany(c); form.setValue('companyId', c.id); setCOpen(false) }}>
                              {c.name}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="contactId" render={() => (
                <FormItem>
                  <FormLabel>Kontakt</FormLabel>
                  <Popover open={kOpen} onOpenChange={setKOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="justify-between w-full">
                        {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : 'Velg kontakt'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="Søk kontakt..." value={contactQuery} onValueChange={setContactQuery} />
                        <CommandList>
                          <CommandEmpty>Ingen treff</CommandEmpty>
                          {contacts?.map((p) => (
                            <CommandItem key={p.id} value={`${p.firstName} ${p.lastName}`} onSelect={() => { setSelectedContact(p); form.setValue('contactId', p.id); setKOpen(false) }}>
                              {p.firstName} {p.lastName}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Lagre</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}



"use client"
import useSWR from 'swr'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type Company = { id: number; name: string }
type Contact = { id: number; firstName: string; lastName: string }

export function NewLeadDialog({ companyId }: { companyId?: number }) {
  const schema = z
    .object({
      description: z.string().min(1),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
    })
    .refine((d) => !!(d.companyId || d.contactId), { message: 'Velg firma eller kontakt', path: ['companyId'] })

  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { description: '', companyId } })

  const [cOpen, setCOpen] = useState(false)
  const [kOpen, setKOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [contactQuery, setContactQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const { data: companies } = useSWR<Company[]>(companyQuery ? `/api/companies?q=${encodeURIComponent(companyQuery)}` : null)
  const { data: contacts } = useSWR<Contact[]>(contactQuery ? `/api/contacts?q=${encodeURIComponent(contactQuery)}` : null)

  useEffect(() => {
    if (companyId) {
      form.setValue('companyId', companyId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  async function onSubmit(values: z.infer<typeof schema>) {
    const res = await fetch('/api/leads', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) return toast.error('Kunne ikke opprette lead')
    toast.success('Lead opprettet')
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

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="companyId" render={() => (
                <FormItem>
                  <FormLabel>Firma</FormLabel>
                  <Popover open={cOpen} onOpenChange={setCOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="justify-between w-full">
                        {selectedCompany?.name || 'Velg firma'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput placeholder="Søk firma..." value={companyQuery} onValueChange={setCompanyQuery} />
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



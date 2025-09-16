'use client'
import useSWR, { useSWRConfig } from 'swr'
import { useEffect, useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type Company = {
  id: number
  name: string
  emailDomain?: string | null
}

export function NewContactDialog({
  companyId,
  companyName,
  trigger,
}: {
  companyId?: number
  companyName?: string
  trigger?: ReactNode
}) {
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
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      linkedInUrl: '',
      companyId,
      startDate: new Date().toISOString().slice(0, 10),
    },
  })
  const [open, setOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<{
    id: number
    name: string
    emailDomain?: string | null
  } | null>(null)
  const { data: companyOptions } = useSWR<Company[]>(
    companyQuery ? `/api/companies?q=${encodeURIComponent(companyQuery)}` : null
  )
  const { mutate: globalMutate } = useSWRConfig()
  const [emailManuallyEdited, setEmailManuallyEdited] = useState(false)

  const firstNameValue = form.watch('firstName')
  const lastNameValue = form.watch('lastName')

  function normalizeNamePart(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
  }

  function buildEmailSuggestion(
    firstName: string,
    lastName: string,
    domain: string | null | undefined
  ): string | undefined {
    if (!domain) return undefined
    const cleanDomain = domain.replace(/^@/, '')
    const first = normalizeNamePart(firstName || '')
    const last = normalizeNamePart(lastName || '')
    if (!first && !last) return undefined
    const local = first && last ? `${first}.${last}` : first || last
    return `${local}@${cleanDomain}`
  }

  useEffect(() => {
    if (companyId) {
      setSelectedCompany({ id: companyId, name: companyName || '' })
      form.setValue('companyId', companyId)
      form.setValue('startDate', new Date().toISOString().slice(0, 10))
    } else {
      setSelectedCompany(null)
      form.setValue('companyId', undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, companyName])

  // Auto-suggest email when company has domain and user hasn't manually edited email
  const domainFromSelection = selectedCompany?.emailDomain

  useEffect(() => {
    if (!domainFromSelection || emailManuallyEdited) return
    const suggestion = buildEmailSuggestion(firstNameValue, lastNameValue, domainFromSelection)
    if (suggestion) {
      form.setValue('email', suggestion, { shouldDirty: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainFromSelection, firstNameValue, lastNameValue, emailManuallyEdited])

  async function onSubmit(values: z.infer<typeof schema>) {
    const res = await fetch('/api/contacts', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) return toast.error('Kunne ikke opprette kontakt')
    toast.success('Kontakt opprettet')
    form.reset()
    const idToRefresh = selectedCompany?.id ?? companyId
    if (idToRefresh) {
      // Refresh company detail cache to show the new contact immediately
      await globalMutate(`/api/companies/${idToRefresh}`)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="secondary">Ny kontakt</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny kontakt</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornavn</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etternavn</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyId"
              render={() => (
                <FormItem>
                  <FormLabel>Kunde</FormLabel>
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
                        {selectedCompany?.name || 'Velg kunde'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                      <Command>
                        <CommandInput
                          autoFocus
                          placeholder="Søk etter kunde..."
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
                                setSelectedCompany({
                                  id: c.id,
                                  name: c.name,
                                  emailDomain: c.emailDomain,
                                })
                                form.setValue('companyId', c.id)
                                // Allow auto-suggestion to apply for newly selected company
                                setEmailManuallyEdited(false)
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
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ansatt dato</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Epost</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        setEmailManuallyEdited(true)
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedInUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2 flex justify-end">
              <Button type="submit" className="inline-flex items-center gap-1.5">
                <Save className="h-4 w-4" /> Lagre
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

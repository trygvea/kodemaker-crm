'use client'
import { useSWRConfig } from 'swr'
import { ReactNode, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Description } from '@radix-ui/react-dialog'

const companySchema = z.object({
  name: z.string().min(1, 'Skriv navn'),
  websiteUrl: z.string().url('Ugyldig URL').optional().or(z.literal('')),
  emailDomain: z.string().optional(),
  contactEmail: z.string().email('Ugyldig epost').optional(),
  description: z.string().optional(),
})

export function NewCompanyDialog({
  onCreated,
  trigger,
}: {
  onCreated?: () => void
  trigger?: ReactNode
}) {
  const { mutate } = useSWRConfig()
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', websiteUrl: '', emailDomain: '', contactEmail: '', description: '' },
  })

  const [websiteEdited, setWebsiteEdited] = useState(false)
  const [domainEdited, setDomainEdited] = useState(false)
  const [contactEdited, setContactEdited] = useState(false)

  const nameValue = form.watch('name')
  const websiteUrlValue = form.watch('websiteUrl')
  const emailDomainValue = form.watch('emailDomain')

  function normalizeForHost(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
  }

  function ensureUrl(value: string): string | undefined {
    if (!value) return undefined
    try {
      return new URL(value).toString()
    } catch {
      try {
        return new URL(`https://${value}`).toString()
      } catch {
        return undefined
      }
    }
  }

  function extractDomainFromUrl(value: string): string | undefined {
    const url = ensureUrl(value)
    if (!url) return undefined
    try {
      const u = new URL(url)
      const host = u.hostname.replace(/^www\./, '')
      return host || undefined
    } catch {
      return undefined
    }
  }

  // Suggest website from name
  useEffect(() => {
    if (!websiteEdited) {
      const host = normalizeForHost(nameValue || '')
      const suggested = host ? `https://${host}.no` : ''
      form.setValue('websiteUrl', suggested, { shouldDirty: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue])

  // Suggest email domain from website
  useEffect(() => {
    if (domainEdited) return
    const domain = extractDomainFromUrl(websiteUrlValue || '')
    if (domain) {
      form.setValue('emailDomain', domain, { shouldDirty: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteUrlValue, domainEdited])

  // Suggest contact email from email domain
  useEffect(() => {
    if (contactEdited) return
    const domain = (emailDomainValue || '').replace(/^@/, '')
    if (domain) {
      form.setValue('contactEmail', `kontakt@${domain}`, { shouldDirty: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailDomainValue, contactEdited])

  async function onSubmit(values: z.infer<typeof companySchema>) {
    const res = await fetch('/api/companies', { method: 'POST', body: JSON.stringify(values) })
    if (!res.ok) {
      toast.error('Kunne ikke opprette organisasjon')
      return
    }
    toast.success('Organisasjon opprettet')
    form.reset()
    await mutate('/api/companies')
    onCreated?.()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger ?? <Button>Ny organisasjon</Button>}</DialogTrigger>
      <DialogContent>
        <Description>Ny organisasjon</Description>
        <DialogHeader>
          <DialogTitle>Ny organisasjon</DialogTitle>
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
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      onChange={(e) => {
                        setWebsiteEdited(true)
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
              name="emailDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post-domene</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example.com"
                      {...field}
                      onChange={(e) => {
                        setDomainEdited(true)
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
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontakt-epost</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="kontakt@example.com"
                      {...field}
                      onChange={(e) => {
                        setContactEdited(true)
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Beskrivelse..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
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

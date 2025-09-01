"use client"
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const companySchema = z.object({
  name: z.string().min(1, 'Skriv navn'),
  websiteUrl: z.string().url('Ugyldig URL').optional().or(z.literal('')),
  emailDomain: z.string().optional(),
  contactEmail: z.string().email('Ugyldig epost').optional(),
})

export function NewCompanyDialog({ onCreated }: { onCreated?: () => void }) {
  const { mutate } = useSWRConfig()
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
    await mutate('/api/companies')
    onCreated?.()
  }

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



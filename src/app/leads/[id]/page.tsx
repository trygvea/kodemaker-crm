"use client"
import useSWR, { useSWRConfig } from 'swr'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'
import { useParams } from 'next/navigation'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const schema = z.object({ description: z.string().min(1), status: z.enum(['NEW', 'IN_PROGRESS', 'LOST', 'WON']) })

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data } = useSWR<{ id: number; description: string; status: 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'; company?: { id: number; name: string } | null; contact?: { id: number; firstName: string; lastName: string } | null }>(id ? `/api/leads/${id}` : null)
  const { mutate } = useSWRConfig()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: data ? { description: data.description, status: data.status } : { description: '', status: 'NEW' },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    const res = await fetch(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(values) })
    if (!res.ok) return toast.error('Kunne ikke oppdatere lead')
    toast.success('Lead oppdatert')
    await mutate(`/api/leads/${id}`)
  }

  if (!data) return <div className="p-6">Laster...</div>
  const crumbs = [
    { label: 'Kundeliste', href: '/customers' },
    ...(data.company ? [{ label: data.company.name, href: `/customers/${data.company.id}` }] : []),
    ...(data.contact ? [{ label: `${data.contact.firstName} ${data.contact.lastName}`, href: `/contacts/${data.contact.id}` }] : []),
    { label: 'Lead' },
  ]
  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumbs items={crumbs} />
      <section>
        <h1 className="text-2xl font-semibold">Lead</h1>
        <div className="text-sm text-muted-foreground space-y-1">
          {data.company ? (
            <div>
              Firma: <a href={`/customers/${data.company.id}`} className="underline">{data.company.name}</a>
            </div>
          ) : null}
          {data.contact ? (
            <div>
              Kontakt: <a href={`/contacts/${data.contact.id}`} className="underline">{data.contact.firstName} {data.contact.lastName}</a>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3 max-w-2xl">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Beskrivelse</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Velg status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Ny</SelectItem>
                    <SelectItem value="IN_PROGRESS">Under arbeid</SelectItem>
                    <SelectItem value="LOST">Tapt</SelectItem>
                    <SelectItem value="WON">Vunnet</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="col-span-2 flex justify-end">
              <Button type="submit">Lagre</Button>
            </div>
          </form>
        </Form>
      </section>
    </div>
  )
}



import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { contacts, contactCompanyHistory, contactEmails } from '@/db/schema'
import { z } from 'zod'
import { createEventWithContext } from '@/db/events'
import { listContacts } from '@/db/contacts'

const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedInUrl: z.string().url().optional().or(z.literal('')),
  companyId: z.number().int().optional(),
  startDate: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || null
  const data = await listContacts(q)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parsed = createContactSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { companyId, startDate, email, ...values } = parsed.data
  
  // Create contact without legacy email field
  const [created] = await db.insert(contacts).values(values).returning()
  
  // If email is provided, create entry in contactEmails table
  if (email && email.trim()) {
    await db.insert(contactEmails).values({
      contactId: created.id,
      email: email.trim(),
      active: true,
    })
  }
  
  await createEventWithContext('contact', created.id, 'Ny kontakt', {
    contactId: created.id,
    companyId: companyId ?? undefined,
  })
  
  if (companyId && startDate) {
    await db.insert(contactCompanyHistory).values({ companyId, contactId: created.id, startDate })
  }
  return NextResponse.json(created)
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { contacts, contactCompanyHistory } from '@/db/schema'
import { z } from 'zod'
import { ilike, desc, or } from 'drizzle-orm'
import { createEvent } from '@/db/events'

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
  const q = searchParams.get('q')?.trim()
  if (q) {
    const data = await db
      .select()
      .from(contacts)
      .where(or(ilike(contacts.firstName, `%${q}%`), ilike(contacts.lastName, `%${q}%`)))
      .limit(50)
    return NextResponse.json(data)
  }
  const data = await db.select().from(contacts).orderBy(desc(contacts.id)).limit(100)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parsed = createContactSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { companyId, startDate, ...values } = parsed.data
  const [created] = await db.insert(contacts).values(values).returning()
  await createEvent('contact', created.id, `Ny kontakt: ${created.firstName} ${created.lastName}`)
  if (companyId && startDate) {
    await db.insert(contactCompanyHistory).values({ companyId, contactId: created.id, startDate })
  }
  return NextResponse.json(created)
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { contacts, contactCompanyHistory, companies } from '@/db/schema'
import { z } from 'zod'
import { ilike, or, asc, eq, isNull, and } from 'drizzle-orm'
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
  if (q && q.length >= 1) {
    const rows = await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        company: {
          id: companies.id,
          name: companies.name,
        },
      })
      .from(contacts)
      .leftJoin(
        contactCompanyHistory,
        and(eq(contactCompanyHistory.contactId, contacts.id), isNull(contactCompanyHistory.endDate))
      )
      .leftJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
      .where(
        or(
          ilike(contacts.firstName, `%${q}%`),
          ilike(contacts.lastName, `%${q}%`),
          ilike(companies.name, `%${q}%`)
        )
      )
      .orderBy(asc(contacts.lastName), asc(contacts.firstName))
      .limit(200)
    const seen = new Set<number>()
    const data = rows.filter((r) => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })
    return NextResponse.json(data)
  }
  const rows = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      company: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(contacts)
    .leftJoin(
      contactCompanyHistory,
      and(eq(contactCompanyHistory.contactId, contacts.id), isNull(contactCompanyHistory.endDate))
    )
    .leftJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .orderBy(asc(contacts.lastName), asc(contacts.firstName))
    .limit(100)
  const seen = new Set<number>()
  const data = rows.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
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

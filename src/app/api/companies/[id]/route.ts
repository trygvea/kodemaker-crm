import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { companies, contacts, contactCompanyHistory, leads, comments } from '@/db/schema'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const companyContacts = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      phone: contacts.phone,
      linkedInUrl: contacts.linkedInUrl,
    })
    .from(contactCompanyHistory)
    .innerJoin(contacts, eq(contacts.id, contactCompanyHistory.contactId))
    .where(and(eq(contactCompanyHistory.companyId, id), isNull(contactCompanyHistory.endDate)))
    .orderBy(desc(contacts.id))

  const companyLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.companyId, id))
    .orderBy(desc(leads.createdAt))

  const companyComments = await db
    .select()
    .from(comments)
    .where(eq(comments.companyId, id))
    .orderBy(desc(comments.createdAt))

  return NextResponse.json({
    company,
    contacts: companyContacts,
    comments: companyComments,
    leads: companyLeads,
  })
}

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  emailDomain: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const json = await req.json()
  const parsed = updateCompanySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const values: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) values.name = parsed.data.name
  if (parsed.data.websiteUrl !== undefined) values.websiteUrl = parsed.data.websiteUrl || null
  if (parsed.data.emailDomain !== undefined) values.emailDomain = parsed.data.emailDomain || null
  if (parsed.data.contactEmail !== undefined) values.contactEmail = parsed.data.contactEmail || null
  const [updated] = await db.update(companies).set(values).where(eq(companies.id, id)).returning()
  return NextResponse.json(updated)
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import {
  companies,
  contactCompanyHistory,
  contacts,
  leads,
  emails,
  comments,
  followups,
  users,
} from '@/db/schema'
import { and, asc, desc, eq, isNull, isNotNull } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1)
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [current] = await db
    .select({
      id: companies.id,
      name: companies.name,
      startDate: contactCompanyHistory.startDate,
      endDate: contactCompanyHistory.endDate,
    })
    .from(contactCompanyHistory)
    .innerJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .where(and(eq(contactCompanyHistory.contactId, id), isNull(contactCompanyHistory.endDate)))
    .orderBy(desc(contactCompanyHistory.startDate))
    .limit(1)

  const previous = await db
    .select({
      id: companies.id,
      name: companies.name,
      startDate: contactCompanyHistory.startDate,
      endDate: contactCompanyHistory.endDate,
    })
    .from(contactCompanyHistory)
    .innerJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .where(and(eq(contactCompanyHistory.contactId, id), isNotNull(contactCompanyHistory.endDate)))
    .orderBy(desc(contactCompanyHistory.endDate))

  const contactLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.contactId, id))
    .orderBy(desc(leads.createdAt))

  const contactEmails = await db
    .select()
    .from(emails)
    .where(eq(emails.recipientContactId, id))
    .orderBy(desc(emails.createdAt))

  const contactComments = await db
    .select()
    .from(comments)
    .where(eq(comments.contactId, id))
    .orderBy(desc(comments.createdAt))

  const openFollowups = await db
    .select({
      id: followups.id,
      note: followups.note,
      dueAt: followups.dueAt,
      createdBy: {
        firstName: users.firstName,
        lastName: users.lastName,
      },
    })
    .from(followups)
    .leftJoin(users, eq(users.id, followups.createdByUserId))
    .where(and(eq(followups.contactId, id), isNull(followups.completedAt)))
    .orderBy(asc(followups.dueAt))

  const history = await db
    .select({
      id: contactCompanyHistory.id,
      startDate: contactCompanyHistory.startDate,
      endDate: contactCompanyHistory.endDate,
      company: {
        id: companies.id,
        name: companies.name,
      },
    })
    .from(contactCompanyHistory)
    .innerJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .where(eq(contactCompanyHistory.contactId, id))
    .orderBy(desc(contactCompanyHistory.startDate))

  return NextResponse.json({
    contact,
    currentCompany: current || null,
    previousCompanies: previous,
    followups: openFollowups,
    comments: contactComments,
    leads: contactLeads,
    emails: contactEmails,
    history,
  })
}

import { z } from 'zod'

const updateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  linkedInUrl: z.string().url().optional().or(z.literal('')),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const json = await req.json()
  const parsed = updateContactSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const values: Record<string, unknown> = {}
  if (parsed.data.firstName !== undefined) values.firstName = parsed.data.firstName
  if (parsed.data.lastName !== undefined) values.lastName = parsed.data.lastName
  if (parsed.data.email !== undefined) values.email = parsed.data.email
  if (parsed.data.phone !== undefined) values.phone = parsed.data.phone
  if (parsed.data.linkedInUrl !== undefined) values.linkedInUrl = parsed.data.linkedInUrl
  const [updated] = await db.update(contacts).set(values).where(eq(contacts.id, id)).returning()
  return NextResponse.json(updated)
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { companies, contacts, followups, leads, users } from '@/db/schema'
import { z } from 'zod'
import { and, asc, eq, inArray, isNull } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createEventFollowupCreated } from '@/db/events'

const createFollowupSchema = z.object({
  note: z.string().min(1),
  // Accept HTML datetime-local (e.g. 2025-09-16T13:45) and coerce to Date
  dueAt: z.coerce.date(),
  companyId: z.number().int().optional(),
  contactId: z.number().int().optional(),
  leadId: z.number().int().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ? Number(session.user.id) : undefined
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'
  const contactId = searchParams.get('contactId')
  const companyId = searchParams.get('companyId')
  const leadId = searchParams.get('leadId')

  const baseOpen = isNull(followups.completedAt)
  const scope = contactId
    ? eq(followups.contactId, Number(contactId))
    : companyId
      ? eq(followups.companyId, Number(companyId))
      : leadId
        ? eq(followups.leadId, Number(leadId))
        : undefined
  const mineOnly = and(eq(followups.createdByUserId, userId!), baseOpen)
  const where = all
    ? scope
      ? and(scope, baseOpen)
      : baseOpen
    : scope
      ? and(scope, mineOnly)
      : mineOnly

  const rows = await db
    .select({
      id: followups.id,
      note: followups.note,
      dueAt: followups.dueAt,
      createdBy: { firstName: users.firstName, lastName: users.lastName },
      companyId: followups.companyId,
      contactId: followups.contactId,
      leadId: followups.leadId,
    })
    .from(followups)
    .leftJoin(users, eq(users.id, followups.createdByUserId))
    .where(where)
    .orderBy(asc(followups.dueAt))
    .limit(200)

  // Resolve missing company/contact via lead references
  const leadIds = Array.from(new Set(rows.map((r) => r.leadId).filter(Boolean))) as number[]
  const leadsById: Record<number, { companyId: number | null; contactId: number | null }> = {}
  if (leadIds.length) {
    const leadRows = await db
      .select({ id: leads.id, companyId: leads.companyId, contactId: leads.contactId })
      .from(leads)
      .where(inArray(leads.id, leadIds))
    for (const l of leadRows)
      leadsById[l.id] = { companyId: l.companyId ?? null, contactId: l.contactId ?? null }
  }

  const resolvedCompanyIds = new Set<number>()
  const resolvedContactIds = new Set<number>()
  const resolved = rows.map((r) => {
    const viaLead = r.leadId ? leadsById[r.leadId] : undefined
    const companyId = r.companyId ?? viaLead?.companyId ?? null
    const contactId = r.contactId ?? viaLead?.contactId ?? null
    if (companyId) resolvedCompanyIds.add(companyId)
    if (contactId) resolvedContactIds.add(contactId)
    return { ...r, companyId, contactId }
  })

  let companiesById: Record<number, { id: number; name: string }> = {}
  let contactsById: Record<
    number,
    { id: number; firstName: string | null; lastName: string | null }
  > = {}
  if (resolvedCompanyIds.size) {
    const coRows = await db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .where(inArray(companies.id, Array.from(resolvedCompanyIds)))
    companiesById = Object.fromEntries(coRows.map((c) => [c.id, c]))
  }
  if (resolvedContactIds.size) {
    const ctRows = await db
      .select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName })
      .from(contacts)
      .where(inArray(contacts.id, Array.from(resolvedContactIds)))
    contactsById = Object.fromEntries(ctRows.map((c) => [c.id, c]))
  }

  const data = resolved.map((r) => ({
    id: r.id,
    note: r.note,
    dueAt: r.dueAt,
    createdBy: r.createdBy,
    company: r.companyId ? (companiesById[r.companyId] ?? null) : null,
    contact: r.contactId ? (contactsById[r.contactId] ?? null) : null,
  }))

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ? Number(session.user.id) : undefined
  const json = await req.json()
  const parsed = createFollowupSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const [created] = await db
    .insert(followups)
    .values({
      note: parsed.data.note,
      dueAt: parsed.data.dueAt,
      companyId: parsed.data.companyId,
      contactId: parsed.data.contactId,
      leadId: parsed.data.leadId,
      createdByUserId: userId,
    })
    .returning()
  const entity = parsed.data.leadId ? 'lead' : parsed.data.companyId ? 'company' : 'contact'
  await createEventFollowupCreated(
    entity,
    (parsed.data.leadId || parsed.data.companyId || parsed.data.contactId)!,
    parsed.data.companyId,
    parsed.data.contactId,
    created.note
  )
  return NextResponse.json(created)
}

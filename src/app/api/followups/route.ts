import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { followups, users } from '@/db/schema'
import { z } from 'zod'
import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createEvent } from '@/db/events'

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
  const isAdmin = session?.user?.role === 'admin'
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

  const data = await db
    .select({
      id: followups.id,
      note: followups.note,
      dueAt: followups.dueAt,
      createdBy: { firstName: users.firstName, lastName: users.lastName },
    })
    .from(followups)
    .leftJoin(users, eq(users.id, followups.createdByUserId))
    .where(where)
    .orderBy(asc(followups.dueAt))
    .limit(200)

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
  await createEvent(
    parsed.data.leadId ? 'lead' : parsed.data.companyId ? 'company' : 'contact',
    (parsed.data.leadId || parsed.data.companyId || parsed.data.contactId)!,
    'Ny oppfølging'
  )
  return NextResponse.json(created)
}

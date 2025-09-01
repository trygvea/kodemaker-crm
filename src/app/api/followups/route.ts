import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { followups } from '@/db/schema'
import { z } from 'zod'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const createFollowupSchema = z.object({
  note: z.string().min(1),
  dueAt: z.string().datetime(),
  companyId: z.number().int().optional(),
  contactId: z.number().int().optional(),
  leadId: z.number().int().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'
  const userId = session?.user?.id ? Number(session.user.id) : undefined

  const data = await db
    .select()
    .from(followups)
    .where(isAdmin ? undefined : and(eq(followups.createdByUserId, userId!), isNull(followups.completedAt)))
    .orderBy(desc(followups.dueAt))
    .limit(100)

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
      dueAt: new Date(parsed.data.dueAt),
      companyId: parsed.data.companyId,
      contactId: parsed.data.contactId,
      leadId: parsed.data.leadId,
      createdByUserId: userId,
    })
    .returning()
  return NextResponse.json(created)
}



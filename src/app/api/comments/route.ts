import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { comments } from '@/db/schema'
import { createEvent } from '@/db/events'
import { z } from 'zod'
import { desc } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const createCommentSchema = z.object({
  content: z.string().min(1),
  companyId: z.number().int().optional(),
  contactId: z.number().int().optional(),
  leadId: z.number().int().optional(),
})

export async function GET() {
  const data = await db.select().from(comments).orderBy(desc(comments.id)).limit(100)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ? Number(session.user.id) : undefined
  const json = await req.json()
  const parsed = createCommentSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const [created] = await db
    .insert(comments)
    .values({ ...parsed.data, createdByUserId: userId })
    .returning()
  await createEvent(
    parsed.data.leadId ? 'lead' : parsed.data.companyId ? 'company' : 'contact',
    (parsed.data.leadId || parsed.data.companyId || parsed.data.contactId)!,
    'Ny kommentar'
  )
  return NextResponse.json(created)
}

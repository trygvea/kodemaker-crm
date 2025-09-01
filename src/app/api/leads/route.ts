import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { leads } from '@/db/schema'
import { z } from 'zod'
import { desc } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const createLeadSchema = z.object({
  companyId: z.number().int(),
  contactId: z.number().int().optional(),
  description: z.string().min(1),
})

export async function GET() {
  const data = await db.select().from(leads).orderBy(desc(leads.id)).limit(100)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ? Number(session.user.id) : undefined
  const json = await req.json()
  const parsed = createLeadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const [created] = await db
    .insert(leads)
    .values({ ...parsed.data, createdByUserId: userId })
    .returning()
  return NextResponse.json(created)
}



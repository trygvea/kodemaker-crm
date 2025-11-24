import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { companies, leads } from '@/db/schema'
import { createEventWithContext } from '@/db/events'
import { z } from 'zod'
import { ilike, inArray, sql } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const createCompanySchema = z.object({
  name: z.string().min(1),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  emailDomain: z.string().optional(),
  contactEmail: z.string().email().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const baseQuery = db.select().from(companies)
  const rows = q
    ? await baseQuery.where(ilike(companies.name, `%${q}%`)).limit(50)
    : await baseQuery.limit(100)

  const ids = rows.map((r) => r.id)
  if (ids.length === 0) return NextResponse.json(rows)

  const counts = await db
    .select({
      companyId: leads.companyId,
      status: leads.status,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(leads)
    .where(inArray(leads.companyId, ids))
    .groupBy(leads.companyId, leads.status)

  const byCompany: Record<number, { NEW: number; IN_PROGRESS: number; LOST: number; WON: number }> =
    {}
  for (const id of ids) {
    byCompany[id] = { NEW: 0, IN_PROGRESS: 0, LOST: 0, WON: 0 }
  }
  for (const c of counts) {
    const status = c.status as 'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'
    byCompany[c.companyId][status] = c.count
  }

  const data = rows.map((r) => ({ ...r, leadCounts: byCompany[r.id] }))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ? Number(session.user.id) : undefined
  const json = await req.json()
  const parsed = createCompanySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const [created] = await db
    .insert(companies)
    .values({ ...parsed.data, createdByUserId: userId })
    .returning()
  await createEventWithContext('company', created.id, 'Ny organisasjon', {
    companyId: created.id,
  })
  return NextResponse.json(created)
}

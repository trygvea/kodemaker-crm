import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { companies, contacts, leads } from '@/db/schema'
import { z } from 'zod'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const createLeadSchema = z.object({
  companyId: z.number().int(),
  contactId: z.number().int().optional(),
  description: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')
  const allowedStatuses = new Set(['NEW', 'IN_PROGRESS', 'LOST', 'WON'])

  const filters: Array<ReturnType<typeof inArray>> = []
  if (statusParam) {
    const statuses = statusParam
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => allowedStatuses.has(s)) as Array<'NEW' | 'IN_PROGRESS' | 'LOST' | 'WON'>
    if (statuses.length > 0) {
      filters.push(inArray(leads.status, statuses))
    }
  }

  const data = await db
    .select({
      id: leads.id,
      description: leads.description,
      status: leads.status,
      company: {
        id: companies.id,
        name: companies.name,
      },
      contact: {
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
      },
    })
    .from(leads)
    .leftJoin(companies, eq(leads.companyId, companies.id))
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(leads.id))
    .limit(100)
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



import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { companies, contacts, leads, leadStatusEnum } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const rows = await db
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
    .where(eq(leads.id, id))
    .limit(1)

  const row = rows[0]
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

const updateLeadSchema = z.object({
  description: z.string().min(1).optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'LOST', 'WON']).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const json = await req.json()
  const parsed = updateLeadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const [updated] = await db
    .update(leads)
    .set({ ...parsed.data })
    .where(eq(leads.id, id))
    .returning()
  return NextResponse.json(updated)
}



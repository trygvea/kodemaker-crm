import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { contacts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getContactDetail } from '@/db/contacts'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const detail = await getContactDetail(id)
  if (!detail) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(detail)
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const [deleted] = await db.delete(contacts).where(eq(contacts.id, id)).returning()
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

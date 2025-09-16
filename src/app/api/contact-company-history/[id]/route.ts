import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { contactCompanyHistory } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional().or(z.literal('')),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const json = await req.json()
  const parsed = updateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const values: Record<string, unknown> = {}
  if (parsed.data.startDate !== undefined) values.startDate = parsed.data.startDate
  if (parsed.data.endDate !== undefined) values.endDate = parsed.data.endDate || null
  const [row] = await db
    .update(contactCompanyHistory)
    .set(values)
    .where(eq(contactCompanyHistory.id, id))
    .returning()
  return NextResponse.json(row)
}

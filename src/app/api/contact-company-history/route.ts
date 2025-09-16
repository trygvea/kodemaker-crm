import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { contactCompanyHistory } from '@/db/schema'
import { z } from 'zod'

const createSchema = z.object({
  contactId: z.number().int(),
  companyId: z.number().int(),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parsed = createSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const values = {
    contactId: parsed.data.contactId,
    companyId: parsed.data.companyId,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate ? parsed.data.endDate : null,
  }
  const [row] = await db.insert(contactCompanyHistory).values(values).returning()
  return NextResponse.json(row)
}

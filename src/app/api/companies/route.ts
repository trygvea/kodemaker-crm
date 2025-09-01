import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { companies } from '@/db/schema'
import { z } from 'zod'
import { ilike } from 'drizzle-orm'

const createCompanySchema = z.object({
  name: z.string().min(1),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  emailDomain: z.string().optional(),
  contactEmail: z.string().email().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (q) {
    const data = await db
      .select()
      .from(companies)
      .where(ilike(companies.name, `%${q}%`))
      .limit(50)
    return NextResponse.json(data)
  }
  const data = await db.select().from(companies).limit(100)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parsed = createCompanySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const [created] = await db.insert(companies).values(parsed.data).returning()
  return NextResponse.json(created)
}



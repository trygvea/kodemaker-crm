import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { events } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const data = await db.select().from(events).orderBy(desc(events.createdAt)).limit(200)
  return NextResponse.json(data)
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { followups } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createEventWithContext } from '@/db/events'

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const rows = await db.select().from(followups).where(eq(followups.id, id)).limit(1)
  const row = rows[0]
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [updated] = await db
    .update(followups)
    .set({ completedAt: new Date() })
    .where(eq(followups.id, id))
    .returning()

  const entity = row.leadId ? 'lead' : row.companyId ? 'company' : 'contact'
  const entityId = row.leadId || row.companyId || row.contactId
  if (entityId) {
    await createEventWithContext(
      entity as 'lead' | 'company' | 'contact',
      entityId,
      'Oppfølging utført',
      {
        companyId: row.companyId ?? undefined,
        contactId: row.contactId ?? undefined,
        excerpt: row.note.slice(0, 80),
      }
    )
  }

  return NextResponse.json(updated)
}

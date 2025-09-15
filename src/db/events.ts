import { db, pool } from '@/db/client'
import { events } from '@/db/schema'

export type EventEntity = 'company' | 'contact' | 'lead'

export async function createEvent(entity: EventEntity, entityId: number, description: string) {
  const [ev] = await db.insert(events).values({ entity, entityId, description }).returning()

  try {
    // Use pg_notify to broadcast event JSON to listeners
    await pool.query('select pg_notify($1, $2)', ['events', JSON.stringify(ev)])
  } catch {
    // Notification is best-effort; ignore errors to avoid breaking main flow
  }

  return ev
}

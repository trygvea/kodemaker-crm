import { db, pool } from '@/db/client'
import { companies, contacts, events, leads } from '@/db/schema'
import { eq } from 'drizzle-orm'

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

export async function createEventWithContext(
  entity: EventEntity,
  entityId: number,
  verb: string,
  options?: { contactId?: number | null; companyId?: number | null; excerpt?: string | null }
) {
  let contactName: string | null = null
  let companyName: string | null = null
  try {
    if (options?.contactId || entity === 'contact') {
      const cid = options?.contactId ?? (entity === 'contact' ? entityId : undefined)
      if (cid) {
        const [c] = await db.select().from(contacts).where(eq(contacts.id, cid)).limit(1)
        if (c) contactName = `${c.firstName} ${c.lastName}`.trim()
      }
    }
    if (options?.companyId || entity === 'company' || entity === 'lead') {
      const coid = options?.companyId ?? (entity === 'company' ? entityId : undefined)
      if (coid) {
        const [co] = await db.select().from(companies).where(eq(companies.id, coid)).limit(1)
        if (co) companyName = co.name
      } else if (entity === 'lead' && !options?.companyId) {
        const [l] = await db.select().from(leads).where(eq(leads.id, entityId)).limit(1)
        if (l) {
          const [co] = await db
            .select()
            .from(companies)
            .where(eq(companies.id, l.companyId))
            .limit(1)
          if (co) companyName = co.name
          if (!options?.contactId && l.contactId) {
            const [c] = await db
              .select()
              .from(contacts)
              .where(eq(contacts.id, l.contactId))
              .limit(1)
            if (c) contactName = `${c.firstName} ${c.lastName}`.trim()
          }
        }
      }
    }
  } catch {}

  const useDash = contactName && companyName
  const context = `${verb} på ${contactName} ${useDash ? ' / ' : ''} ${companyName ?? ''}`.trim()
  const desc = options?.excerpt ? `${context}: ${options.excerpt}` : context
  return createEvent(entity, entityId, desc)
}

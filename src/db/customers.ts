import { db } from '@/db/client'
import { companies, contacts, contactCompanyHistory, leads, comments } from '@/db/schema'
import { and, desc, eq, isNull } from 'drizzle-orm'

export async function getCompanyDetail(id: number) {
  const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
  if (!company) return null

  const companyContacts = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      phone: contacts.phone,
      linkedInUrl: contacts.linkedInUrl,
    })
    .from(contactCompanyHistory)
    .innerJoin(contacts, eq(contacts.id, contactCompanyHistory.contactId))
    .where(and(eq(contactCompanyHistory.companyId, id), isNull(contactCompanyHistory.endDate)))
    .orderBy(desc(contacts.id))

  const companyLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.companyId, id))
    .orderBy(desc(leads.createdAt))

  const companyComments = await db
    .select()
    .from(comments)
    .where(eq(comments.companyId, id))
    .orderBy(desc(comments.createdAt))

  return { company, contacts: companyContacts, leads: companyLeads, comments: companyComments }
}

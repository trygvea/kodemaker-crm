import { db } from '@/db/client'
import {
  companies,
  contactCompanyHistory,
  contacts,
  leads,
  emails,
  comments,
  followups,
  users,
} from '@/db/schema'
import { and, asc, desc, eq, ilike, isNull, isNotNull, or } from 'drizzle-orm'

export async function getContactDetail(id: number) {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1)
  if (!contact) return null

  const [current] = await db
    .select({
      id: companies.id,
      name: companies.name,
      startDate: contactCompanyHistory.startDate,
      endDate: contactCompanyHistory.endDate,
    })
    .from(contactCompanyHistory)
    .innerJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .where(and(eq(contactCompanyHistory.contactId, id), isNull(contactCompanyHistory.endDate)))
    .orderBy(desc(contactCompanyHistory.startDate))
    .limit(1)

  const previous = await db
    .select({
      id: companies.id,
      name: companies.name,
      startDate: contactCompanyHistory.startDate,
      endDate: contactCompanyHistory.endDate,
    })
    .from(contactCompanyHistory)
    .innerJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .where(and(eq(contactCompanyHistory.contactId, id), isNotNull(contactCompanyHistory.endDate)))
    .orderBy(desc(contactCompanyHistory.endDate))

  const contactLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.contactId, id))
    .orderBy(desc(leads.createdAt))

  const contactEmails = await db
    .select()
    .from(emails)
    .where(eq(emails.recipientContactId, id))
    .orderBy(desc(emails.createdAt))

  const contactComments = await db
    .select()
    .from(comments)
    .where(eq(comments.contactId, id))
    .orderBy(desc(comments.createdAt))

  const openFollowups = await db
    .select({
      id: followups.id,
      note: followups.note,
      dueAt: followups.dueAt,
      createdBy: { firstName: users.firstName, lastName: users.lastName },
    })
    .from(followups)
    .leftJoin(users, eq(users.id, followups.createdByUserId))
    .where(and(eq(followups.contactId, id), isNull(followups.completedAt)))
    .orderBy(asc(followups.dueAt))

  const history = await db
    .select({
      id: contactCompanyHistory.id,
      startDate: contactCompanyHistory.startDate,
      endDate: contactCompanyHistory.endDate,
      company: { id: companies.id, name: companies.name },
    })
    .from(contactCompanyHistory)
    .innerJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .where(eq(contactCompanyHistory.contactId, id))
    .orderBy(desc(contactCompanyHistory.startDate))

  return {
    contact,
    currentCompany: current || null,
    previousCompanies: previous,
    followups: openFollowups,
    comments: contactComments,
    leads: contactLeads,
    emails: contactEmails,
    history,
  }
}

export async function listContacts(query: string | null) {
  const isSearch = query && query.trim().length >= 1
  const limit = isSearch ? 200 : 100
  const base = db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      company: { id: companies.id, name: companies.name },
    })
    .from(contacts)
    .leftJoin(
      contactCompanyHistory,
      and(eq(contactCompanyHistory.contactId, contacts.id), isNull(contactCompanyHistory.endDate))
    )
    .leftJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .orderBy(asc(contacts.lastName), asc(contacts.firstName))
    .limit(limit)

  const rows = isSearch
    ? await base.where(
        or(
          ilike(contacts.firstName, `%${query}%`),
          ilike(contacts.lastName, `%${query}%`),
          ilike(companies.name, `%${query}%`)
        )
      )
    : await base

  // De-duplicate by id
  const seen = new Set<number>()
  const data = rows.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })

  return data
}

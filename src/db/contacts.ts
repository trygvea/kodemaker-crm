import { db } from '@/db/client'
import {
  companies,
  contactCompanyHistory,
  contacts,
  contactEmails,
  leads,
  emails,
  comments,
  followups,
  users,
} from '@/db/schema'
import { and, asc, desc, eq, ilike, isNull, isNotNull, or, inArray, count, sql } from 'drizzle-orm'

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

  const contactEmailAddresses = await db
    .select({
      id: contactEmails.id,
      email: contactEmails.email,
      active: contactEmails.active,
      createdAt: contactEmails.createdAt,
    })
    .from(contactEmails)
    .where(eq(contactEmails.contactId, id))
    .orderBy(desc(contactEmails.createdAt))

  const contactEmailsData = await db
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
    emails: contactEmailsData,
    contactEmails: contactEmailAddresses,
    history,
  }
}

export async function listContacts(query: string | null) {
  const isSearch = query && query.trim().length >= 1
  const limit = isSearch ? 200 : 100
  
  // First, get the basic contact info with company
  const baseContacts = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      company: { id: companies.id, name: companies.name },
    })
    .from(contacts)
    .leftJoin(
      contactCompanyHistory,
      and(eq(contactCompanyHistory.contactId, contacts.id), isNull(contactCompanyHistory.endDate))
    )
    .leftJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
    .where(
      isSearch
        ? or(
            ilike(contacts.firstName, `%${query}%`),
            ilike(contacts.lastName, `%${query}%`),
            ilike(companies.name, `%${query}%`)
          )
        : undefined
    )
    .orderBy(asc(contacts.lastName), asc(contacts.firstName))
    .limit(limit)

  // If searching, also get contacts that match by email from contact_emails table
  let emailMatchContacts: typeof baseContacts = []
  if (isSearch) {
    emailMatchContacts = await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        company: { id: companies.id, name: companies.name },
      })
      .from(contacts)
      .innerJoin(contactEmails, eq(contactEmails.contactId, contacts.id))
      .leftJoin(
        contactCompanyHistory,
        and(eq(contactCompanyHistory.contactId, contacts.id), isNull(contactCompanyHistory.endDate))
      )
      .leftJoin(companies, eq(companies.id, contactCompanyHistory.companyId))
      .where(ilike(contactEmails.email, `%${query}%`))
      .orderBy(asc(contacts.lastName), asc(contacts.firstName))
      .limit(limit)
  }

  // Combine and deduplicate results
  const allContacts = [...baseContacts, ...emailMatchContacts]
  const seen = new Set<number>()
  const uniqueContacts = allContacts.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })

  // Now get all emails for these contacts
  const contactIds = uniqueContacts.map(c => c.id)
  if (contactIds.length === 0) {
    return []
  }

  const contactEmailsData = await db
    .select({
      contactId: contactEmails.contactId,
      email: contactEmails.email,
      active: contactEmails.active,
    })
    .from(contactEmails)
    .where(inArray(contactEmails.contactId, contactIds))
    .orderBy(contactEmails.createdAt)

  // Group emails by contact ID and concatenate them
  const emailsByContactId = contactEmailsData.reduce((acc, ce) => {
    if (!acc[ce.contactId]) {
      acc[ce.contactId] = []
    }
    acc[ce.contactId].push(ce.email)
    return acc
  }, {} as Record<number, string[]>)

  // Add concatenated emails to each contact
  return uniqueContacts.map(contact => ({
    ...contact,
    emails: emailsByContactId[contact.id]?.join('; ') || '',
  }))
}

export async function getContactCounts(contactId: number) {
  // Get count of related items for merge dialog
  const [emailAddressesCount] = await db
    .select({ count: count(contactEmails.id) })
    .from(contactEmails)
    .where(eq(contactEmails.contactId, contactId))

  const [emailsCount] = await db
    .select({ count: count(emails.id) })
    .from(emails)
    .where(eq(emails.recipientContactId, contactId))

  const [leadsCount] = await db
    .select({ count: count(leads.id) })
    .from(leads)
    .where(eq(leads.contactId, contactId))

  const [commentsCount] = await db
    .select({ count: count(comments.id) })
    .from(comments)
    .where(eq(comments.contactId, contactId))

  const [followupsCount] = await db
    .select({ count: count(followups.id) })
    .from(followups)
    .where(eq(followups.contactId, contactId))

  return {
    emailAddresses: emailAddressesCount?.count || 0,
    emails: emailsCount?.count || 0,
    leads: leadsCount?.count || 0,
    events: commentsCount?.count || 0, // Using comments as events for now
    followups: followupsCount?.count || 0,
  }
}

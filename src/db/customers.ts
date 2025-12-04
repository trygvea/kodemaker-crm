import { db } from '@/db/client'
import {
  companies,
  contacts,
  contactCompanyHistory,
  leads,
  comments,
  users,
  contactEmails,
} from '@/db/schema'
import { and, desc, eq, isNull, inArray } from 'drizzle-orm'

export async function getCompanyDetail(id: number) {
  const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
  if (!company) return null
  let createdBy: { firstName: string | null; lastName: string | null } | null = null
  if (company.createdByUserId) {
    const [u] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, company.createdByUserId))
      .limit(1)
    if (u) createdBy = u
  }

  const companyContacts = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      role: contacts.role,
      phone: contacts.phone,
      linkedInUrl: contacts.linkedInUrl,
    })
    .from(contactCompanyHistory)
    .innerJoin(contacts, eq(contacts.id, contactCompanyHistory.contactId))
    .where(and(eq(contactCompanyHistory.companyId, id), isNull(contactCompanyHistory.endDate)))
    .orderBy(desc(contacts.id))

  // Fetch contact emails for all contacts
  const contactIds = companyContacts.map((c) => c.id)
  let contactEmailsData: Array<{ contactId: number; email: string; active: boolean }> = []

  if (contactIds.length > 0) {
    contactEmailsData = await db
      .select({
        contactId: contactEmails.contactId,
        email: contactEmails.email,
        active: contactEmails.active,
      })
      .from(contactEmails)
      .where(inArray(contactEmails.contactId, contactIds))
      .orderBy(contactEmails.createdAt)
  }

  // Group emails by contact ID
  const emailsByContactId = contactEmailsData.reduce(
    (acc, ce) => {
      if (!acc[ce.contactId]) {
        acc[ce.contactId] = []
      }
      acc[ce.contactId].push(ce.email)
      return acc
    },
    {} as Record<number, string[]>
  )

  // Add emails array to each contact
  const contactsWithEmails = companyContacts.map((contact) => ({
    ...contact,
    emails: emailsByContactId[contact.id] || [],
  }))

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

  return {
    company,
    contacts: contactsWithEmails,
    leads: companyLeads,
    comments: companyComments,
    createdBy,
  }
}

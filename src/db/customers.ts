import { db } from "@/db/client";
import {
  comments,
  companies,
  contactCompanyHistory,
  contactEmails,
  contacts,
  leads,
  users,
} from "@/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";

export async function getCompanyDetail(id: number) {
  const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  if (!company) return null;
  let createdBy: { firstName: string | null; lastName: string | null } | null = null;
  if (company.createdByUserId) {
    const [u] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, company.createdByUserId))
      .limit(1);
    if (u) createdBy = u;
  }

  const companyContacts = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      role: contactCompanyHistory.role,
      phone: contacts.phone,
      linkedInUrl: contacts.linkedInUrl,
      endDate: contactCompanyHistory.endDate,
    })
    .from(contactCompanyHistory)
    .innerJoin(contacts, eq(contacts.id, contactCompanyHistory.contactId))
    .where(eq(contactCompanyHistory.companyId, id))
    .orderBy(
      // Active contacts first (endDate IS NULL), then quit contacts by endDate DESC
      sql`CASE WHEN ${contactCompanyHistory.endDate} IS NULL THEN 0 ELSE 1 END`,
      desc(contactCompanyHistory.endDate)
    );

  // Fetch contact emails for all contacts
  const contactIds = companyContacts.map((c) => c.id);
  let contactEmailsData: Array<{ contactId: number; email: string; active: boolean }> = [];

  if (contactIds.length > 0) {
    contactEmailsData = await db
      .select({
        contactId: contactEmails.contactId,
        email: contactEmails.email,
        active: contactEmails.active,
      })
      .from(contactEmails)
      .where(inArray(contactEmails.contactId, contactIds))
      .orderBy(contactEmails.createdAt);
  }

  // Group emails by contact ID
  const emailsByContactId = contactEmailsData.reduce(
    (acc, ce) => {
      if (!acc[ce.contactId]) {
        acc[ce.contactId] = [];
      }
      acc[ce.contactId].push(ce.email);
      return acc;
    },
    {} as Record<number, string[]>
  );

  // Add emails array to each contact
  const contactsWithEmails = companyContacts.map((contact) => ({
    ...contact,
    emails: emailsByContactId[contact.id] || [],
  }));

  const companyLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.companyId, id))
    .orderBy(desc(leads.createdAt));

  const companyComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      createdBy: { firstName: users.firstName, lastName: users.lastName },
    })
    .from(comments)
    .leftJoin(users, eq(users.id, comments.createdByUserId))
    .where(eq(comments.companyId, id))
    .orderBy(desc(comments.createdAt));

  return {
    company,
    contacts: contactsWithEmails,
    leads: companyLeads,
    comments: companyComments,
    createdBy,
  };
}

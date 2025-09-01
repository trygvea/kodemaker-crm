import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { companies, contacts, contactCompanyHistory, leads } from '@/db/schema'
import { and, desc, eq, isNull } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const companyContacts = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
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
    .orderBy(desc(leads.id))

  return NextResponse.json({ company, contacts: companyContacts, leads: companyLeads })
}



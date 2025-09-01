import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { companies, contactCompanyHistory, contacts, leads } from '@/db/schema'
import { and, desc, eq, isNull, isNotNull } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1)
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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
    .orderBy(desc(leads.id))

  return NextResponse.json({ contact, currentCompany: current || null, previousCompanies: previous, leads: contactLeads })
}



import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { db } from '@/db/client'
import { companies, contactCompanyHistory, contacts, emails, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createHmac } from 'crypto'
import {} from './parse-mail'
import { postmarkInboundSchema, parsePostmarkInboundEmail } from './parse-mail'

export async function POST(req: NextRequest) {
  logger.info({ route: '/api/emails', method: 'POST' }, 'api call')
  // Read raw body to optionally verify Postmark signature
  const rawBody = await req.text()
  let body: unknown
  try {
    body = JSON.parse(rawBody || '{}')
  } catch {
    return NextResponse.json({ error: 'Mail body is unparsable' }, { status: 400 })
  }

  const signingKey = process.env.POSTMARK_WEBHOOK_SECRET
  const signature = req.headers.get('x-postmark-signature') || undefined
  if (signingKey && signature) {
    const expected = createHmac('sha256', signingKey).update(rawBody, 'utf8').digest('base64')
    if (expected !== signature) {
      logger.error({ route: '/api/emails', method: 'POST' }, 'Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  const parsed = postmarkInboundSchema.safeParse(body)
  if (!parsed.success) {
    logger.error(
      { route: '/api/emails', method: 'POST' },
      'Parse failed: ' + JSON.stringify(parsed.error.flatten())
    )
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const parsedMail = parsePostmarkInboundEmail(parsed.data)
  if (parsedMail.mode === 'ERROR') {
    logger.error({ route: '/api/emails', method: 'POST' }, 'Parse failed: ' + parsedMail.error)
    return NextResponse.json({ error: parsedMail.error }, { status: 400 })
  }

  if (!parsedMail.contactEmail) {
    logger.error({ route: '/api/emails', method: 'POST' }, 'Missing contact mail')
    return NextResponse.json({ error: 'Missing contact mail' }, { status: 400 })
  }

  if (!parsedMail.body) {
    logger.error({ route: '/api/emails', method: 'POST' }, 'No text in body')
    return NextResponse.json({ error: 'No text in body' }, { status: 400 })
  }

  if (!parsedMail.crmUser) {
    logger.error({ route: '/api/emails', method: 'POST' }, 'Crm user not found')
    return NextResponse.json({ error: 'Crm user not found' }, { status: 400 })
  }

  // Find or create contact
  const [maybeContact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.email, parsedMail.contactEmail))
  let contactId = maybeContact?.id
  if (!maybeContact) {
    const localPart = parsedMail.contactEmail.split('@')[0]
    logger.info(
      { route: '/api/emails', method: 'POST' },
      'creating contact for email ' + parsedMail.contactEmail
    )
    const [created] = await db
      .insert(contacts)
      .values({ firstName: localPart, lastName: '', email: parsedMail.contactEmail })
      .returning()
    contactId = created.id
  }

  // Find or create contactHistory (and company if not found)
  const companyDomain = parsedMail.contactEmail.split('@')[1]
  const [maybeContactHistory] = await db
    .select()
    .from(contactCompanyHistory)
    .where(eq(contactCompanyHistory.contactId, contactId))
  if (!maybeContactHistory) {
    // Find or create company
    const [maybeCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.emailDomain, companyDomain))
    let companyId = maybeCompany?.id
    if (!maybeCompany) {
      const name = companyDomain.split('.').slice(0, -1).join('.')
      const capitalizedName = name.at(0)?.toUpperCase() + name.slice(1)
      const [createdCompany] = await db
        .insert(companies)
        .values({
          name: capitalizedName,
          emailDomain: companyDomain,
        })
        .returning()
      companyId = createdCompany.id
      logger.info({ route: '/api/emails', method: 'POST' }, `Create company ${capitalizedName}`)
    }
    // Now, create contactHistory
    await db
      .insert(contactCompanyHistory)
      .values({ contactId, companyId, startDate: new Date().toISOString() })
      .returning()
  }

  // Find created by user
  const [createdByUser] = await db.select().from(users).where(eq(users.email, parsedMail.crmUser))
  if (!createdByUser) {
    logger.error(
      { route: '/api/emails', method: 'POST' },
      `User with email ${parsedMail.crmUser} not in user db`
    )
    return NextResponse.json(
      { error: `User with email ${parsedMail.crmUser} not in user db` },
      { status: 400 }
    )
  }

  // Insert email
  const [createdEmail] = await db
    .insert(emails)
    .values({
      content: parsedMail.body,
      recipientContactId: contactId,
      sourceUserId: createdByUser.id,
      mode: parsedMail.mode,
    })
    .returning()

  logger.info(
    { route: '/api/emails', method: 'POST' },
    `Imported ${parsedMail.mode} email from ${parsedMail.contactEmail}`
  )

  return NextResponse.json(createdEmail)
}

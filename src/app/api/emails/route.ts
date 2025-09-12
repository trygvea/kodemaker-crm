import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { db } from '@/db/client'
import { contacts, emails, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createHmac } from 'crypto'
import { z } from 'zod'
import {
  postmarkInboundSchema,
  findRecipientEmailFromBCC,
  findRecipientEmailFromFORWARDED,
  findCreatedByEmail,
} from './postmark-utils'
import { parseForwardedMessages } from './parse-forwarded'
import { parsePostmarkInboundEmail } from './parse-mail'

type MODE = 'FORWARDED' | 'BCC'

function getContentFromForwarded(mail: z.infer<typeof postmarkInboundSchema>): string | undefined {
  const forwarded = parseForwardedMessages(mail.TextBody || mail.HtmlBody || '')
  logger.info({ route: '/api/emails', method: 'POST', mail, forwarded }, 'Parsed forwarded email')
  if (forwarded && forwarded.length > 0) {
    return [
      forwarded[0].headers.subject && `Subject: ${forwarded[0].headers.subject}`,
      // TODO missing comments from forwarder
      forwarded[0].body && `Original body: ${forwarded[0].body}`,
    ]
      .filter(Boolean)
      .join('\n')
  }
  return ''
}

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

  const mode: MODE = parsed.data.Bcc && parsed.data.Bcc.trim().length > 0 ? 'BCC' : 'FORWARDED'

  const content =
    mode === 'BCC'
      ? parsed.data.StrippedTextReply || parsed.data.TextBody || parsed.data.HtmlBody || ''
      : getContentFromForwarded(parsed.data)

  const recipientEmail =
    mode === 'BCC'
      ? findRecipientEmailFromBCC(parsed.data)
      : findRecipientEmailFromFORWARDED(parsed.data)

  if (!recipientEmail || !content) {
    logger.error({ route: '/api/emails', method: 'POST' }, 'Missing recipient or content')
    return NextResponse.json({ error: 'Missing recipient or content' }, { status: 400 })
  }

  const [maybeContact] = await db.select().from(contacts).where(eq(contacts.email, recipientEmail))
  let contactId = maybeContact?.id

  if (!maybeContact) {
    const localPart = recipientEmail.split('@')[0]
    logger.info(
      { route: '/api/emails', method: 'POST' },
      'creating contact for email ' + recipientEmail
    )
    const [created] = await db
      .insert(contacts)
      .values({ firstName: localPart, lastName: '', email: recipientEmail })
      .returning()
    contactId = created.id
  }

  const createdByEmail = findCreatedByEmail(parsed.data)
  if (!createdByEmail) {
    logger.error({ route: '/api/emails', method: 'POST' }, 'No created by email found')
    return NextResponse.json({ error: 'No created by email found' }, { status: 400 })
  }
  const [createdByUser] = await db.select().from(users).where(eq(users.email, createdByEmail))

  if (!createdByUser) {
    logger.error(
      { route: '/api/emails', method: 'POST' },
      'No user defined with email ' + createdByEmail
    )
    return NextResponse.json(
      { error: 'No user defined with email ' + createdByEmail },
      { status: 400 }
    )
  }

  const [createdEmail] = await db
    .insert(emails)
    .values({
      content,
      recipientContactId: contactId,
      sourceUserId: createdByUser.id,
      mode,
    })
    .returning()

  logger.info(
    { route: '/api/emails', method: 'POST' },
    `Imported ${mode} email from ${recipientEmail}`
  )

  return NextResponse.json(createdEmail)
}

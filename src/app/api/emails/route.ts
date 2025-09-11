import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { db } from '@/db/client'
import { contacts, emails, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createHmac } from 'crypto'
import { z } from 'zod'

type MODE = 'FORWARDED' | 'BCC'

const postmarkEmailAddressSchema = z.object({
  Email: z.string().email(),
  Name: z.string().optional().nullable(),
})

const postmarkInboundSchema = z.object({
  From: z.string().optional(),
  To: z.string().optional(),
  ToFull: z.array(postmarkEmailAddressSchema).optional(),
  FromFull: postmarkEmailAddressSchema,
  Bcc: z.string().optional(),
  StrippedTextReply: z.string().optional(),
  TextBody: z.string().optional(),
  HtmlBody: z.string().optional(),
})

function extractFirstEmailFromAddressList(value?: string): string | undefined {
  if (!value) return undefined
  const first = value.split(',')[0]
  const m = first.match(/<([^>]+)>/)
  return (m ? m[1] : first).trim()
}

function findRecipientEmailFromBCC(mail: z.infer<typeof postmarkInboundSchema>): string | undefined {
  return mail.ToFull?.[0]?.Email || extractFirstEmailFromAddressList(mail.To)
}

function findRecipientEmailFromFORWARDED(mail: z.infer<typeof postmarkInboundSchema>): string | undefined {
  const body = mail.TextBody || mail.HtmlBody || ''
  const match = body.match(/^From:.*<([^>]+)>/m)
  if (match) {
    return match[1].trim();
  }

  // If no <> brackets, try to find a bare email in the From line
  const fallback = body.match(/^From:.*?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/m);
  if (fallback) {
    return fallback[1].trim();
  }

  return undefined;
}

function findCreatedByEmail(mail: z.infer<typeof postmarkInboundSchema>): string | undefined {
  return mail.FromFull?.Email || extractFirstEmailFromAddressList(mail.From)  
}


export async function POST(req: NextRequest) {
  logger.info({ route: '/api/emails', method: 'POST' }, 'api call')
  // Read raw body to optionally verify Postmark signature
  const rawBody = await req.text()
  let body: unknown
  try {
    body = JSON.parse(rawBody || '{}')
  } catch {
    body = {}
  }

  // Optional Postmark signature verification
  const signingKey = process.env.POSTMARK_WEBHOOK_SECRET
  const signature = req.headers.get('x-postmark-signature') || undefined
  if (signingKey && signature) {
    try {
      const expected = createHmac('sha256', signingKey).update(rawBody, 'utf8').digest('base64')
      if (expected !== signature) {
        logger.error({ route: '/api/emails', method: 'POST' }, 'Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } catch {
      // If verification fails due to env/crypto, continue without blocking
    }
  }

  const parsed = postmarkInboundSchema.safeParse(body)
  if (!parsed.success) {
    logger.error({ route: '/api/emails', method: 'POST' }, 'Parse failed: ' + JSON.stringify(parsed.error.flatten()))
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const content: string | undefined = parsed.data.StrippedTextReply || parsed.data.TextBody || parsed.data.HtmlBody || ''
  const mode: MODE = parsed.data.Bcc && parsed.data.Bcc.trim().length > 0 ? 'BCC' : 'FORWARDED'

  const recipientEmail = mode === 'BCC' 
    ? findRecipientEmailFromBCC(parsed.data) 
    : findRecipientEmailFromFORWARDED(parsed.data)

  logger.info({ route: '/api/emails', method: 'POST' }, 'Recipient email: ' + recipientEmail)

  if (!recipientEmail || !content) {
    logger.error({ route: '/api/emails', method: 'POST' }, 'Missing recipient or content')
    return NextResponse.json({ error: 'Missing recipient or content' }, { status: 400 })
  }

  const [maybeContact] = await db.select().from(contacts).where(eq(contacts.email, recipientEmail))
  let contactId = maybeContact?.id

  if (!maybeContact) {
    const localPart = recipientEmail.split('@')[0]
    logger.info({ route: '/api/emails', method: 'POST' }, 'creating contact')
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
    logger.error({ route: '/api/emails', method: 'POST' }, 'No user defined with email ' + createdByEmail)
    return NextResponse.json({ error: 'No user defined with email ' + createdByEmail }, { status: 400 })
  }

  const [createdEmail] = await db
    .insert(emails)
    .values({ content, recipientContactId: contactId, sourceUserId: createdByUser.id, mode })
    .returning()

    logger.info({ route: '/api/emails', method: 'POST' }, 'Email imported from' + recipientEmail)

    return NextResponse.json(createdEmail)
}



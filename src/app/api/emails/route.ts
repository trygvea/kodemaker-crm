import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { db } from '@/db/client'
import { contacts, emails } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createHmac } from 'crypto'
import { z } from 'zod'

const postmarkEmailAddressSchema = z.object({
  Email: z.string().email(),
  Name: z.string().optional().nullable(),
})

const postmarkInboundSchema = z.object({
  From: z.string().optional(),
  To: z.string().optional(),
  ToFull: z.array(postmarkEmailAddressSchema).optional(),
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

export async function POST(req: NextRequest) {
  try { logger.info({ route: '/api/emails', method: 'POST' }, 'api call') } catch {}
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
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } catch {
      // If verification fails due to env/crypto, continue without blocking
    }
  }

  // Parse and validate Postmark inbound payload using zod
  const parsed = postmarkInboundSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const recipientEmail: string | undefined = parsed.data.ToFull?.[0]?.Email || extractFirstEmailFromAddressList(parsed.data.To)
  const content: string | undefined = parsed.data.StrippedTextReply || parsed.data.TextBody || parsed.data.HtmlBody || ''
  const mode: 'FORWARDED' | 'BCC' = parsed.data.Bcc && parsed.data.Bcc.trim().length > 0 ? 'BCC' : 'FORWARDED'

  if (!recipientEmail || !content) {
    return NextResponse.json({ error: 'Missing recipient or content' }, { status: 400 })
  }

  const localPart = recipientEmail.split('@')[0]
  const [maybeContact] = await db.select().from(contacts).where(eq(contacts.email, recipientEmail))

  let contactId: number | undefined = maybeContact?.id

  if (!contactId) {
    const [created] = await db
      .insert(contacts)
      .values({ firstName: localPart, lastName: '', email: recipientEmail })
      .returning()
    contactId = created.id
  }

  const [createdEmail] = await db
    .insert(emails)
    .values({ content, recipientContactId: contactId, mode })
    .returning()

  return NextResponse.json(createdEmail)
}



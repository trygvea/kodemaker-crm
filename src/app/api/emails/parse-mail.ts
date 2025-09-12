import { z } from 'zod'
import { parseForwardedMessages } from './parse-forwarded'

const postmarkEmailAddressSchema = z.object({
  Email: z.string().email(),
  Name: z.string().optional().nullable(),
})

export const postmarkInboundSchema = z.object({
  From: z.string().optional(),
  To: z.string().optional(),
  ToFull: z.array(postmarkEmailAddressSchema).optional(),
  FromFull: postmarkEmailAddressSchema,
  Date: z.string().optional(),
  Subject: z.string().optional(),
  Bcc: z.string().optional(),
  StrippedTextReply: z.string().optional(),
  TextBody: z.string().optional(),
  HtmlBody: z.string().optional(),
})

type Mode = 'FORWARDED' | 'BCC' | 'ERROR'

export type ParsedMail = {
  mode: Mode
  crmUser?: string // The crm user doing the BCC or FORWARD
  contactEmail?: string // customer email address. BCC: will be the mail TO-address, FORWARDED: parsed from Forwarded section
  date?: string // created-date
  subject?: string
  body?: string
  forwardComment?: string // The body text that the forwarding user adds, will be handled as a comment in the CRM.
}

export type ParseError = {
  mode: 'ERROR'
  error: string
}

function extractFirstEmailFromAddressList(value?: string): string | undefined {
  if (!value) return undefined
  const first = value.split(',')[0]
  const m = first.match(/<([^>]+)>/)
  return (m ? m[1] : first).trim()
}

export function parsePostmarkInboundEmail(
  mail: z.infer<typeof postmarkInboundSchema>
): ParsedMail | ParseError {
  const mode = mail.Bcc && mail.Bcc.trim().length > 0 ? 'BCC' : 'FORWARDED'
  const crmUser = mail.FromFull?.Email || extractFirstEmailFromAddressList(mail.From)
  const date = mail.Date
  const subject = mail.Subject
  const body = mail.TextBody || mail.HtmlBody || ''

  if (mode === 'FORWARDED') {
    const forwarded = parseForwardedMessages(body)
    if (!forwarded || forwarded.length === 0) {
      return {
        mode: 'ERROR',
        error: 'No forwarded messages found',
      }
    }
    return {
      mode: 'FORWARDED',
      crmUser,
      contactEmail: extractFirstEmailFromAddressList(forwarded[0].headers.from),
      date,
      subject,
      body: forwarded[0].body,
      forwardComment: mail.StrippedTextReply?.split('\n').slice(0, -1).join('\n').trimEnd(),
    }
  } else {
    return {
      mode: 'BCC',
      crmUser,
      contactEmail: mail.ToFull?.[0]?.Email || extractFirstEmailFromAddressList(mail.To),
      date,
      subject,
      body: mail.TextBody || mail.HtmlBody || '',
    }
  }
}

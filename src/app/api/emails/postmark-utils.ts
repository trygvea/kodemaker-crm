import { z } from 'zod'

const postmarkEmailAddressSchema = z.object({
    Email: z.string().email(),
    Name: z.string().optional().nullable(),
  })
  
export const postmarkInboundSchema = z.object({
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
  
  export function findRecipientEmailFromBCC(mail: z.infer<typeof postmarkInboundSchema>): string | undefined {
    return mail.ToFull?.[0]?.Email || extractFirstEmailFromAddressList(mail.To)
  }
  
  export function findRecipientEmailFromFORWARDED(mail: z.infer<typeof postmarkInboundSchema>): string | undefined {
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
  
  export function findCreatedByEmail(mail: z.infer<typeof postmarkInboundSchema>): string | undefined {
    return mail.FromFull?.Email || extractFirstEmailFromAddressList(mail.From)  
  }
  
  
  
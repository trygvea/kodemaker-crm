import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { contacts, emails } from '@/db/schema'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const inboundEmailSchema = z.object({
  recipientEmail: z.string().email(),
  content: z.string().min(1),
  mode: z.enum(['FORWARDED', 'BCC']).default('FORWARDED'),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ? Number(session.user.id) : undefined
  const json = await req.json()
  const parsed = inboundEmailSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const localPart = parsed.data.recipientEmail.split('@')[0]
  const [maybeContact] = await db.select().from(contacts).where(eq(contacts.email, parsed.data.recipientEmail))

  let contactId: number | undefined = maybeContact?.id

  if (!contactId) {
    const [created] = await db
      .insert(contacts)
      .values({ firstName: localPart, lastName: '', email: parsed.data.recipientEmail })
      .returning()
    contactId = created.id
  }

  const [createdEmail] = await db
    .insert(emails)
    .values({ content: parsed.data.content, recipientContactId: contactId, sourceUserId: userId, mode: parsed.data.mode })
    .returning()

  return NextResponse.json(createdEmail)
}



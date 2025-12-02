import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { contactCompanyHistory, contactEmails, contacts } from "@/db/schema";
import { z } from "zod";
import { createEventContactCreated } from "@/db/events";
import { listContacts } from "@/db/contacts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  companyId: z.number().int().optional(),
  startDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || null;
  const data = await listContacts(q);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : undefined;
  const json = await req.json();
  const parsed = createContactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, {
      status: 400,
    });
  }
  const { companyId, startDate, email, ...values } = parsed.data;

  // Create contact without legacy email field
  const [created] = await db
    .insert(contacts)
    .values({ ...values, createdByUserId: userId })
    .returning();

  // If email is provided, create entry in contactEmails table
  if (email && email.trim()) {
    await db.insert(contactEmails).values({
      contactId: created.id,
      email: email.trim(),
      active: true,
    });
  }

  await createEventContactCreated(created.id, companyId);

  if (companyId && startDate) {
    await db.insert(contactCompanyHistory).values({
      companyId,
      contactId: created.id,
      startDate,
    });
  }
  return NextResponse.json(created);
}

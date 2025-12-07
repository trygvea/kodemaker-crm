import { db, pool } from "@/db/client";
import { companies, contacts, events } from "@/db/schema";
import { eq } from "drizzle-orm";

export type EventEntity = "company" | "contact" | "lead";

export async function createEvent(
  entity: EventEntity,
  entityId: number,
  description: string,
) {
  const [ev] = await db.insert(events).values({ entity, entityId, description })
    .returning();

  try {
    // Use pg_notify to broadcast event JSON to listeners
    await pool.query("select pg_notify($1, $2)", [
      "events",
      JSON.stringify(ev),
    ]);
  } catch {
    // Notification is best-effort; ignore errors to avoid breaking main flow
  }

  return ev;
}

// Helper function to build event description
async function buildEventDescription(
  verb: string,
  contactId?: number,
  companyId?: number,
  excerpt?: string,
): Promise<string> {
  let contactName: string | null = null;
  let companyName: string | null = null;

  try {
    if (contactId) {
      const [c] = await db.select().from(contacts).where(
        eq(contacts.id, contactId),
      ).limit(1);
      if (c) contactName = `${c.firstName} ${c.lastName}`.trim();
    }
    if (companyId) {
      const [co] = await db.select().from(companies).where(
        eq(companies.id, companyId),
      ).limit(1);
      if (co) companyName = co.name;
    }
  } catch {}

  const useDash = contactName && companyName;
  const context = `${verb}: ${contactName ?? ""} ${useDash ? " / " : ""} ${
    companyName ?? ""
  }`.trim();
  return excerpt ? `${context}: ${excerpt}` : context;
}

// Contact events
export async function createEventContactCreated(
  contactId: number,
  companyId?: number,
) {
  const description = await buildEventDescription(
    "Ny kontakt",
    contactId,
    companyId,
  );
  return createEvent("contact", contactId, description);
}

export async function createEventContactEmailAdded(
  contactId: number,
  email: string,
  active: boolean,
) {
  const excerpt = `${email}${active === false ? " (inaktiv)" : ""}`;
  const description = await buildEventDescription(
    "Ny e-postadresse",
    contactId,
    undefined,
    excerpt,
  );
  return createEvent("contact", contactId, description);
}

export async function createEventContactEmailUpdated(
  contactId: number,
  changes: string,
) {
  const description = await buildEventDescription(
    "Oppdatert e-postadresse",
    contactId,
    undefined,
    changes,
  );
  return createEvent("contact", contactId, description);
}

export async function createEventContactEmailRemoved(
  contactId: number,
  email: string,
) {
  const description = await buildEventDescription(
    "Fjernet e-postadresse",
    contactId,
    undefined,
    email,
  );
  return createEvent("contact", contactId, description);
}

export async function createEventContactMerged(
  targetContactId: number,
  sourceContactName: string,
  sourceContactId: number,
) {
  const excerpt =
    `Merged contact ${sourceContactName} (ID: ${sourceContactId})`;
  const description = await buildEventDescription(
    "Merge",
    targetContactId,
    undefined,
    excerpt,
  );
  return createEvent("contact", targetContactId, description);
}

export async function createEventContactDeleted(
  contactId: number,
  contactName: string,
  targetContactName: string,
) {
  const excerpt =
    `Contact ${contactName} deleted after merge into ${targetContactName}`;
  const description = await buildEventDescription(
    "Slettet",
    contactId,
    undefined,
    excerpt,
  );
  return createEvent("contact", contactId, description);
}

// Company events
export async function createEventCompanyCreated(companyId: number) {
  const description = await buildEventDescription(
    "Ny organisasjon",
    undefined,
    companyId,
  );
  return createEvent("company", companyId, description);
}

// Lead events
export async function createEventLeadCreated(
  leadId: number,
  companyId: number,
  contactId?: number,
  description?: string,
) {
  const excerpt = description ? description.slice(0, 80) : undefined;
  const desc = await buildEventDescription(
    "Ny lead",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent("lead", leadId, desc);
}

// Comment events
export async function createEventCommentCreated(
  entity: "lead" | "company" | "contact",
  entityId: number,
  companyId?: number,
  contactId?: number,
  content?: string,
) {
  const excerpt = content ? content.slice(0, 80) : undefined;
  const description = await buildEventDescription(
    "Ny kommentar",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent(entity, entityId, description);
}

export async function createEventCommentUpdated(
  entity: "lead" | "company" | "contact",
  entityId: number,
  companyId?: number,
  contactId?: number,
  content?: string,
) {
  const excerpt = content ? content.slice(0, 80) : undefined;
  const description = await buildEventDescription(
    "Kommentar oppdatert",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent(entity, entityId, description);
}

export async function createEventCommentDeleted(
  entity: "lead" | "company" | "contact",
  entityId: number,
  companyId?: number,
  contactId?: number,
  content?: string,
) {
  const excerpt = content ? content.slice(0, 80) : undefined;
  const description = await buildEventDescription(
    "Kommentar slettet",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent(entity, entityId, description);
}

// Followup events
export async function createEventFollowupCreated(
  entity: "lead" | "company" | "contact",
  entityId: number,
  companyId?: number,
  contactId?: number,
  note?: string,
) {
  const excerpt = note ? note.slice(0, 80) : undefined;
  const description = await buildEventDescription(
    "Ny oppfølging",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent(entity, entityId, description);
}

export async function createEventFollowupCompleted(
  entity: "lead" | "company" | "contact",
  entityId: number,
  companyId?: number,
  contactId?: number,
  note?: string,
) {
  const excerpt = note ? note.slice(0, 80) : undefined;
  const description = await buildEventDescription(
    "Oppfølging utført",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent(entity, entityId, description);
}

export async function createEventFollowupUpdated(
  entity: "lead" | "company" | "contact",
  entityId: number,
  companyId?: number,
  contactId?: number,
  note?: string,
) {
  const excerpt = note ? note.slice(0, 80) : undefined;
  const description = await buildEventDescription(
    "Oppfølging oppdatert",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent(entity, entityId, description);
}

export async function createEventFollowupDeleted(
  entity: "lead" | "company" | "contact",
  entityId: number,
  companyId?: number,
  contactId?: number,
  note?: string,
) {
  const excerpt = note ? note.slice(0, 80) : undefined;
  const description = await buildEventDescription(
    "Oppfølging slettet",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent(entity, entityId, description);
}

// Email events
export async function createEventEmailReceived(
  contactId: number,
  companyId: number | undefined,
  subject: string,
  mode: "BCC" | "FORWARDED",
) {
  const type = mode === "BCC" ? "BCC" : "videresendt";
  const excerpt = `${type}: ${subject}`.trim();
  const description = await buildEventDescription(
    "Ny e-post",
    contactId,
    companyId,
    excerpt,
  );
  return createEvent("contact", contactId, description);
}

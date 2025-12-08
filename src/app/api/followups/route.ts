import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { companies, contacts, followups, leads, users } from "@/db/schema";
import { z } from "zod";
import { and, asc, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createEventFollowupCreated } from "@/db/events";
import { logger } from "@/lib/logger";

const createFollowupSchema = z.object({
  note: z.string().min(1),
  // Accept HTML datetime-local (e.g. 2025-09-16T13:45) and coerce to Date
  dueAt: z.coerce.date(),
  companyId: z.number().int().optional(),
  contactId: z.number().int().optional(),
  leadId: z.number().int().optional(),
  assignedToUserId: z.number().int().optional(),
});

const queryParamsSchema = z.object({
  all: z.string().optional().transform((val) => val === "1"),
  completed: z.string().optional().transform((val) => val === "1"),
  contactId: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const num = Number(val);
    return isNaN(num) || num <= 0 ? undefined : num;
  }),
  companyId: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const num = Number(val);
    return isNaN(num) || num <= 0 ? undefined : num;
  }),
  leadId: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const num = Number(val);
    return isNaN(num) || num <= 0 ? undefined : num;
  }),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : undefined;
    const { searchParams } = new URL(req.url);
    const parsed = queryParamsSchema.safeParse({
      all: searchParams.get("all") ?? undefined,
      completed: searchParams.get("completed") ?? undefined,
      contactId: searchParams.get("contactId") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      leadId: searchParams.get("leadId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, {
        status: 400,
      });
    }

    const { all, completed, contactId, companyId, leadId } = parsed.data;

    const baseCondition = completed
      ? isNotNull(followups.completedAt)
      : isNull(followups.completedAt);
    const scope = contactId
      ? eq(followups.contactId, contactId)
      : companyId
      ? eq(followups.companyId, companyId)
      : leadId
      ? eq(followups.leadId, leadId)
      : undefined;
    const mineOnly = and(eq(followups.createdByUserId, userId!), baseCondition);
    const where = all
      ? scope ? and(scope, baseCondition) : baseCondition
      : scope
      ? and(scope, mineOnly)
      : mineOnly;

    const rows = await db
      .select({
        id: followups.id,
        note: followups.note,
        dueAt: followups.dueAt,
        completedAt: followups.completedAt,
        createdAt: followups.createdAt,
        createdBy: { firstName: users.firstName, lastName: users.lastName },
        assignedToUserId: followups.assignedToUserId,
        companyId: followups.companyId,
        contactId: followups.contactId,
        leadId: followups.leadId,
      })
      .from(followups)
      .leftJoin(users, eq(users.id, followups.createdByUserId))
      .where(where)
      .orderBy(
        completed ? desc(followups.completedAt) : asc(followups.dueAt),
        asc(followups.id),
      )
      .limit(200);

    // Resolve missing company/contact via lead references and get lead info
    const leadIds = Array.from(
      new Set(rows.map((r) => r.leadId).filter(Boolean)),
    ) as number[];
    const leadsById: Record<
      number,
      {
        companyId: number | null;
        contactId: number | null;
        description: string;
      }
    > = {};
    if (leadIds.length) {
      const leadRows = await db
        .select({
          id: leads.id,
          companyId: leads.companyId,
          contactId: leads.contactId,
          description: leads.description,
        })
        .from(leads)
        .where(inArray(leads.id, leadIds));
      for (const l of leadRows) {
        leadsById[l.id] = {
          companyId: l.companyId ?? null,
          contactId: l.contactId ?? null,
          description: l.description,
        };
      }
    }

    const resolvedCompanyIds = new Set<number>();
    const resolvedContactIds = new Set<number>();
    const resolved = rows.map((r) => {
      const viaLead = r.leadId ? leadsById[r.leadId] : undefined;
      const companyId = r.companyId ?? viaLead?.companyId ?? null;
      const contactId = r.contactId ?? viaLead?.contactId ?? null;
      if (companyId) resolvedCompanyIds.add(companyId);
      if (contactId) resolvedContactIds.add(contactId);
      return { ...r, companyId, contactId };
    });

    const assignedToUserIds = Array.from(
      new Set(rows.map((r) => r.assignedToUserId).filter(Boolean)),
    ) as number[];
    let assignedToUsersById: Record<
      number,
      { id: number; firstName: string; lastName: string }
    > = {};
    if (assignedToUserIds.length) {
      const assignedRows = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(inArray(users.id, assignedToUserIds));
      assignedToUsersById = Object.fromEntries(
        assignedRows.map((u) => [u.id, u]),
      );
    }

    let companiesById: Record<number, { id: number; name: string }> = {};
    let contactsById: Record<
      number,
      { id: number; firstName: string | null; lastName: string | null }
    > = {};
    if (resolvedCompanyIds.size) {
      const coRows = await db
        .select({ id: companies.id, name: companies.name })
        .from(companies)
        .where(inArray(companies.id, Array.from(resolvedCompanyIds)));
      companiesById = Object.fromEntries(coRows.map((c) => [c.id, c]));
    }
    if (resolvedContactIds.size) {
      const ctRows = await db
        .select({
          id: contacts.id,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
        })
        .from(contacts)
        .where(inArray(contacts.id, Array.from(resolvedContactIds)));
      contactsById = Object.fromEntries(ctRows.map((c) => [c.id, c]));
    }

    const data = resolved.map((r) => ({
      id: r.id,
      note: r.note,
      dueAt: r.dueAt,
      completedAt: r.completedAt,
      createdAt: r.createdAt,
      createdBy: r.createdBy,
      assignedTo: r.assignedToUserId
        ? (assignedToUsersById[r.assignedToUserId] ?? null)
        : null,
      company: r.companyId ? (companiesById[r.companyId] ?? null) : null,
      contact: r.contactId ? (contactsById[r.contactId] ?? null) : null,
      lead: r.leadId
        ? {
          id: r.leadId,
          description: leadsById[r.leadId]?.description ?? "",
        }
        : null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    logger.error(
      { route: "/api/followups", method: "GET", error },
      "Error fetching followups",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : undefined;
    const json = await req.json();
    const parsed = createFollowupSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, {
        status: 400,
      });
    }
    const [created] = await db
      .insert(followups)
      .values({
        note: parsed.data.note,
        dueAt: parsed.data.dueAt,
        companyId: parsed.data.companyId,
        contactId: parsed.data.contactId,
        leadId: parsed.data.leadId,
        createdByUserId: userId,
        assignedToUserId: parsed.data.assignedToUserId,
      })
      .returning();
    const entity = parsed.data.leadId
      ? "lead"
      : parsed.data.companyId
      ? "company"
      : "contact";
    await createEventFollowupCreated(
      entity,
      (parsed.data.leadId || parsed.data.companyId || parsed.data.contactId)!,
      parsed.data.companyId,
      parsed.data.contactId,
      created.note,
    );
    return NextResponse.json(created);
  } catch (error) {
    logger.error(
      { route: "/api/followups", method: "POST", error },
      "Error creating followup",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

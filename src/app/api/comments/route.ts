import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { comments, users } from "@/db/schema";
import { createEventCommentCreated } from "@/db/events";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logger } from "@/lib/logger";

const createCommentSchema = z.object({
  content: z.string().min(1),
  companyId: z.number().int().optional(),
  contactId: z.number().int().optional(),
  leadId: z.number().int().optional(),
});

const queryParamsSchema = z.object({
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
    const { searchParams } = new URL(req.url);
    const parsed = queryParamsSchema.safeParse({
      contactId: searchParams.get("contactId") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      leadId: searchParams.get("leadId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, {
        status: 400,
      });
    }

    const { contactId, companyId, leadId } = parsed.data;

    // Require at least one valid scope parameter
    if (!contactId && !companyId && !leadId) {
      return NextResponse.json(
        {
          error:
            "At least one scope parameter (contactId, companyId, or leadId) is required",
        },
        { status: 400 },
      );
    }

    let where = undefined;
    if (contactId) {
      where = eq(comments.contactId, contactId);
    } else if (companyId) {
      where = eq(comments.companyId, companyId);
    } else if (leadId) {
      where = eq(comments.leadId, leadId);
    }

    const data = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        createdBy: { firstName: users.firstName, lastName: users.lastName },
      })
      .from(comments)
      .leftJoin(users, eq(users.id, comments.createdByUserId))
      .where(where)
      .orderBy(desc(comments.createdAt))
      .limit(200);

    return NextResponse.json(data);
  } catch (error) {
    logger.error(
      { route: "/api/comments", method: "GET", error },
      "Error fetching comments",
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
    const parsed = createCommentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, {
        status: 400,
      });
    }
    const [created] = await db
      .insert(comments)
      .values({ ...parsed.data, createdByUserId: userId })
      .returning();
    const entity = parsed.data.leadId
      ? "lead"
      : parsed.data.companyId
      ? "company"
      : "contact";
    await createEventCommentCreated(
      entity,
      (parsed.data.leadId || parsed.data.companyId || parsed.data.contactId)!,
      parsed.data.companyId,
      parsed.data.contactId,
      created.content,
    );
    return NextResponse.json(created);
  } catch (error) {
    logger.error(
      { route: "/api/comments", method: "POST", error },
      "Error creating comment",
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

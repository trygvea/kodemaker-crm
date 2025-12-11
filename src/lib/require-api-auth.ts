import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type AuthenticatedSession = Session & { user: NonNullable<Session["user"]> };

/**
 * Validates authentication for API routes.
 * Returns the session if authenticated, or a 401 response if not.
 *
 * Usage in API routes:
 * ```
 * const authResult = await requireApiAuth();
 * if (authResult instanceof NextResponse) return authResult;
 * const session = authResult;
 * const userId = Number(session.user.id);
 * ```
 */
export async function requireApiAuth(): Promise<
  AuthenticatedSession | NextResponse
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session as AuthenticatedSession;
}

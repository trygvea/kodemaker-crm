import { redirect } from "next/navigation";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type AuthenticatedSession = Session & { user: NonNullable<Session["user"]> };

/**
 * Server-side auth check for protected pages.
 * Redirects to /login if not authenticated.
 * Returns a session with guaranteed non-null user.
 */
export async function requireAuth(): Promise<AuthenticatedSession> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return session as AuthenticatedSession;
}

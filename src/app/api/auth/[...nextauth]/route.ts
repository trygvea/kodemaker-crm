import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  logger.error(
    { route: "/api/auth" },
    "NEXTAUTH_SECRET is not set. Authentication will not work properly."
  );
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  logger.warn(
    { route: "/api/auth" },
    "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set. Google OAuth will not work."
  );
}
if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
  logger.warn(
    { route: "/api/auth" },
    "NEXTAUTH_URL is not set in production. OAuth callbacks may fail."
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      try {
        if (account?.provider !== "google") return false;
        const email =
          profile && typeof profile === "object" && "email" in profile
            ? String((profile as { email?: string }).email)
            : undefined;
        if (!email) {
          logger.warn(
            { route: "/api/auth/signin" },
            "Google OAuth sign-in attempted without email"
          );
          return false;
        }
        const domain = email.split("@")[1]?.toLowerCase();
        if (domain !== "kodemaker.no") {
          logger.warn(
            { route: "/api/auth/signin", email },
            "Sign-in attempted with non-kodemaker.no email"
          );
          return false;
        }
        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!existing) {
          const name =
            profile && typeof profile === "object" && "name" in profile
              ? String((profile as { name?: string }).name)
              : undefined;
          const given =
            profile && typeof profile === "object" && "given_name" in profile
              ? String((profile as { given_name?: string }).given_name)
              : undefined;
          const family =
            profile && typeof profile === "object" && "family_name" in profile
              ? String((profile as { family_name?: string }).family_name)
              : undefined;
          const firstName = given || name?.split(" ")?.[0] || "";
          const lastName = family || name?.split(" ")?.slice(1).join(" ") || "";
          const passwordHash = await bcrypt.hash("google-login", 8);
          await db.insert(users).values({
            firstName,
            lastName,
            email,
            passwordHash,
            role: "user",
          });
          logger.info(
            { route: "/api/auth/signin", email },
            "Auto-provisioned new user during sign-in"
          );
        }
        return true;
      } catch (error) {
        logger.error({ route: "/api/auth/signin", error }, "Error in signIn callback");
        return false;
      }
    },
    async jwt({ token }) {
      try {
        if (token.email) {
          const [u] = await db.select().from(users).where(eq(users.email, token.email)).limit(1);
          if (u) {
            token.id = String(u.id);
            token.role = u.role;
          }
        }
        return token;
      } catch (error) {
        logger.error({ route: "/api/auth/jwt", error }, "Error in jwt callback");
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as "admin" | "user" | undefined;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

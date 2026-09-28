import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { checkAdminLoginRateLimit } from "./admin-rate-limit";

function clientIpFromHeaders(headerList: Headers): string {
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const headerList = await headers();
        const ip = clientIpFromHeaders(headerList);
        const rateLimit = await checkAdminLoginRateLimit(ip);
        if (!rateLimit.allowed) {
          return null;
        }

        const email = process.env.ADMIN_EMAIL ?? "admin@free-epg.de";
        const password = process.env.ADMIN_PASSWORD ?? "admin";
        if (
          credentials?.email === email &&
          credentials?.password === password
        ) {
          return { id: "1", name: "Admin", email };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
};

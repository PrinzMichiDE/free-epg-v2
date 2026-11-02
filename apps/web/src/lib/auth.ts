import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const isProduction = process.env.NODE_ENV === "production";

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (isProduction) {
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in production");
  }
  if (!nextAuthSecret || nextAuthSecret === "dev-secret-change-me") {
    throw new Error("NEXTAUTH_SECRET must be set to a strong secret in production");
  }
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
        const email = adminEmail ?? "admin@free-epg.de";
        const password = adminPassword ?? "admin";
        if (
          credentials?.email &&
          credentials?.password &&
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
  secret: nextAuthSecret ?? "dev-secret-change-me",
};

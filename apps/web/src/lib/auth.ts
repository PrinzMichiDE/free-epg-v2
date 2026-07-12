import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
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

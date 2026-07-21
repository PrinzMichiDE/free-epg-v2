"use client";

import { signIn } from "next-auth/react";

export function AdminLoginForm({ callbackUrl = "/admin" }: { callbackUrl?: string }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        signIn("credentials", {
          email: fd.get("email"),
          password: fd.get("password"),
          callbackUrl,
        });
      }}
      className="space-y-4"
    >
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="username"
        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        autoComplete="current-password"
        className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
      />
      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]"
      >
        Anmelden
      </button>
    </form>
  );
}

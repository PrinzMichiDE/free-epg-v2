"use client";

import { SessionProvider } from "next-auth/react";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminHeader />
      {children}
    </SessionProvider>
  );
}

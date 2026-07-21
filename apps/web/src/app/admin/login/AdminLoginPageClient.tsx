"use client";

import { useSearchParams } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPageClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
      <AdminLoginForm callbackUrl={callbackUrl} />
    </div>
  );
}

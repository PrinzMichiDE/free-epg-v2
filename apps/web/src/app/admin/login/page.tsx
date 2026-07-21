import { Suspense } from "react";
import AdminLoginPageClient from "./AdminLoginPageClient";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-12">Lade...</div>}>
      <AdminLoginPageClient />
    </Suspense>
  );
}

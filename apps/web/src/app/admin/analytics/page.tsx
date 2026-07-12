"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<{
    summary: { pageViews: number; apiRequests: number; days: number };
    topCountries: { country: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/analytics?days=30")
        .then((r) => r.json())
        .then(setData);
    }
  }, [session]);

  if (!session) return <div className="p-12">Bitte anmelden</div>;
  if (!data) return <div className="p-12">Lade Analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-2xl font-bold">{data.summary.pageViews}</p>
          <p className="text-sm text-[var(--muted)]">Page Views (30d)</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-2xl font-bold">{data.summary.apiRequests}</p>
          <p className="text-sm text-[var(--muted)]">API Requests (30d)</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Top Länder (API)</h2>
      <div className="h-64 rounded-xl border border-[var(--border)] p-4 bg-[var(--card)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.topCountries}>
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

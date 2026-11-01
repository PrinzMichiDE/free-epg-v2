"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface TakedownRequest {
  id: number;
  requesterName: string | null;
  requesterEmail: string;
  requesterOrg: string | null;
  requestType: string;
  targetUrl: string | null;
  targetContent: string | null;
  description: string;
  signature: string | null;
  status: string;
  actionTaken: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export default function AdminTakedownsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<TakedownRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TakedownRequest | null>(null);
  const [actionTaken, setActionTaken] = useState("");

  useEffect(() => {
    if (session) {
      fetch("/api/admin/takedowns")
        .then((r) => r.json())
        .then((data) => {
          setRequests(data.requests || []);
          setLoading(false);
        });
    }
  }, [session]);

  const updateStatus = async (id: number, newStatus: string) => {
    await fetch("/api/admin/takedowns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus, actionTaken }),
    });
    setRequests(
      requests.map((r) =>
        r.id === id
          ? { ...r, status: newStatus, actionTaken, resolvedAt: new Date().toISOString() }
          : r
      )
    );
    setSelected(null);
    setActionTaken("");
  };

  if (status === "loading" || loading) return <div className="p-12">Lade...</div>;
  if (!session) return <div className="p-12">Nicht autorisiert</div>;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    in_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Takedown-Anfragen</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Datum</th>
              <th className="text-left p-2">Antragsteller</th>
              <th className="text-left p-2">Typ</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-[var(--border)] hover:bg-[var(--card)]">
                <td className="p-2">{req.id}</td>
                <td className="p-2">{new Date(req.createdAt).toLocaleString("de-DE")}</td>
                <td className="p-2">
                  {req.requesterOrg || req.requesterName || req.requesterEmail}
                </td>
                <td className="p-2">{req.requestType}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[req.status]}`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => setSelected(req)}
                    className="text-[var(--primary)] hover:underline"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[var(--background)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">Takedown-Anfrage #{selected.id}</h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong>E-Mail:</strong> {selected.requesterEmail}
              </p>
              {selected.requesterName && (
                <p>
                  <strong>Name:</strong> {selected.requesterName}
                </p>
              )}
              {selected.requesterOrg && (
                <p>
                  <strong>Organisation:</strong> {selected.requesterOrg}
                </p>
              )}
              <p>
                <strong>Typ:</strong> {selected.requestType}
              </p>
              {selected.targetUrl && (
                <p>
                  <strong>URL:</strong> <a href={selected.targetUrl}>{selected.targetUrl}</a>
                </p>
              )}
              <p>
                <strong>Beschreibung:</strong>
                <br />
                {selected.description}
              </p>
              {selected.signature && (
                <p>
                  <strong>Signatur:</strong> {selected.signature}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">Maßnahme</label>
              <textarea
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded"
                rows={3}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => updateStatus(selected.id, "in_review")}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                In Bearbeitung
              </button>
              <button
                onClick={() => updateStatus(selected.id, "resolved")}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Erledigt
              </button>
              <button
                onClick={() => updateStatus(selected.id, "rejected")}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Abgelehnt
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  setActionTaken("");
                }}
                className="px-4 py-2 border border-[var(--border)] rounded"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import legal from "@/config/legal.json";

export default function TakedownPage() {
  const [formData, setFormData] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterOrg: "",
    requestType: "copyright",
    targetUrl: "",
    targetContent: "",
    description: "",
    signature: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/legal/takedown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Request submitted successfully.");
        setFormData({
          requesterName: "",
          requesterEmail: "",
          requesterOrg: "",
          requestType: "copyright",
          targetUrl: "",
          targetContent: "",
          description: "",
          signature: "",
        });
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to submit request.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <article className="page-shell py-10 sm:py-14 max-w-2xl">
      <h1 className="font-serif text-3xl sm:text-4xl mb-4">Takedown-Anfrage</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8">
        Verwenden Sie dieses Formular, um eine Entfernung rechtswidriger Inhalte zu beantragen.
        Wir werden Ihre Anfrage schnellstmöglich bearbeiten.
      </p>

      {status === "success" ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          <p className="text-green-800 dark:text-green-200">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="requesterEmail" className="block text-sm font-medium mb-1">
              E-Mail-Adresse <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="requesterEmail"
              name="requesterEmail"
              required
              value={formData.requesterEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)]"
            />
          </div>

          <div>
            <label htmlFor="requesterName" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="requesterName"
              name="requesterName"
              value={formData.requesterName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)]"
            />
          </div>

          <div>
            <label htmlFor="requesterOrg" className="block text-sm font-medium mb-1">
              Organisation / Rechteinhaber
            </label>
            <input
              type="text"
              id="requesterOrg"
              name="requesterOrg"
              value={formData.requesterOrg}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)]"
            />
          </div>

          <div>
            <label htmlFor="requestType" className="block text-sm font-medium mb-1">
              Art der Anfrage <span className="text-red-500">*</span>
            </label>
            <select
              id="requestType"
              name="requestType"
              required
              value={formData.requestType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)]"
            >
              <option value="copyright">Urheberrechtsverletzung</option>
              <option value="illegal">Illegale Inhalte</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>

          <div>
            <label htmlFor="targetUrl" className="block text-sm font-medium mb-1">
              Betroffene URL
            </label>
            <input
              type="url"
              id="targetUrl"
              name="targetUrl"
              value={formData.targetUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)]"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Beschreibung der Rechtsverletzung <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)]"
              placeholder="Bitte beschreiben Sie detailliert, warum die Inhalte entfernt werden sollten..."
            />
          </div>

          <div>
            <label htmlFor="signature" className="block text-sm font-medium mb-1">
              Unterschrift / Bestätigung
            </label>
            <input
              type="text"
              id="signature"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              placeholder="Vollständiger Name zur Bestätigung"
              className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)]"
            />
          </div>

          {status === "error" && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-red-800 dark:text-red-200 text-sm">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-6 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting" ? "Wird gesendet..." : "Anfrage senden"}
          </button>
        </form>
      )}

      {legal.takedown?.email && (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">
          Alternativ können Sie auch eine E-Mail senden an: {legal.takedown.email}
        </p>
      )}
    </article>
  );
}

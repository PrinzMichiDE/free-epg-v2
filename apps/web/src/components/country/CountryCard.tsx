"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock, Copy, ExternalLink } from "lucide-react";
import { cn, formatNumber, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CountryFlag } from "@/components/country/CountryFlag";
import { getCountryName } from "@/lib/countries";

interface CountryCardProps {
  code: string;
  channelCount: number;
  hasEpg: boolean;
  lastUpdate: string | null;
  xmlUrl: string;
  rytecGzipUrl: string;
}

export function CountryCard({
  code,
  channelCount,
  hasEpg,
  lastUpdate,
  xmlUrl,
  rytecGzipUrl,
}: CountryCardProps) {
  const [copied, setCopied] = useState<"xmltv" | "rytec" | null>(null);

  const copyUrl = async (path: string, kind: "xmltv" | "rytec") => {
    const full = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(full);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  const xmlGzipUrl = xmlUrl.endsWith(".xml") ? `${xmlUrl}.gz` : xmlUrl;

  return (
    <article className="surface-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CountryFlag code={code} size="md" />
          <div className="min-w-0">
            <h3 className="font-semibold text-base tracking-tight truncate">
              {getCountryName(code)}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {code} · {formatNumber(channelCount)} Sender
            </p>
          </div>
        </div>
        <Badge variant={hasEpg ? "success" : "warning"}>
          {hasEpg ? (
            <span className="inline-flex items-center gap-1">
              <Check className="h-3 w-3" aria-hidden />
              EPG
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              Pending
            </span>
          )}
        </Badge>
      </div>

      {lastUpdate && (
        <p className="text-xs text-[var(--muted-foreground)]">
          Aktualisiert: {formatDate(lastUpdate)}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <Link
          href={`/countries/${code.toLowerCase()}`}
          className={cn(
            "col-span-2 flex items-center justify-center gap-1.5",
            "h-10 rounded-lg border border-[var(--border)] text-sm font-medium",
            "text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors duration-200"
          )}
        >
          Details
          <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
        </Link>
        <Button
          variant="primary"
          size="sm"
          className="col-span-1"
          onClick={() => copyUrl(xmlGzipUrl, "xmltv")}
          aria-label={`XMLTV URL für ${code} kopieren`}
        >
          {copied === "xmltv" ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          XMLTV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="col-span-1"
          onClick={() => copyUrl(rytecGzipUrl, "rytec")}
          aria-label={`Rytec URL für ${code} kopieren`}
        >
          {copied === "rytec" ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          Rytec
        </Button>
      </div>
    </article>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { absoluteUrl, copyToClipboard } from "@/lib/clipboard";

interface XmlUrlBoxProps {
  url: string;
  gzipUrl?: string;
  title?: string;
  description?: string;
}

export function XmlUrlBox({
  url,
  gzipUrl,
  title = "XMLTV Feed",
  description,
}: XmlUrlBoxProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const displayPath = gzipUrl ?? url;
  const fullUrl = absoluteUrl(displayPath);

  const copy = async () => {
    setCopyError(false);
    const ok = await copyToClipboard(fullUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  return (
    <Card className="hover:shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <code className="font-mono text-xs sm:text-sm block p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] break-all leading-relaxed">
        {fullUrl}
      </code>

      {copyError && (
        <p className="text-xs text-[var(--destructive)] mt-2">
          Kopieren fehlgeschlagen — URL oben manuell markieren oder „Öffnen“ nutzen.
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        <Button size="sm" onClick={copy} aria-label={`${title} URL kopieren`}>
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Kopiert
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden />
              URL kopieren
            </>
          )}
        </Button>
        <ButtonLink href={displayPath} variant="outline" size="sm">
          <ExternalLink className="h-4 w-4" aria-hidden />
          Öffnen
        </ButtonLink>
        <ButtonLink href={url} variant="outline" size="sm" download>
          <Download className="h-4 w-4" aria-hidden />
          XML
        </ButtonLink>
        {gzipUrl && (
          <ButtonLink href={gzipUrl} variant="outline" size="sm" download>
            <Download className="h-4 w-4" aria-hidden />
            .gz
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

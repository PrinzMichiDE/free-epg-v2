"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

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

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayUrl = gzipUrl ?? url;
  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${displayUrl}` : displayUrl;

  return (
    <Card className="hover:shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <code className="font-mono text-xs sm:text-sm block p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] break-all leading-relaxed">
        {fullUrl}
      </code>

      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          size="sm"
          onClick={() => copy(fullUrl)}
          aria-label={`${title} URL kopieren`}
        >
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
        <a href={url} download className="inline-flex">
          <Button variant="outline" size="sm" type="button">
            <Download className="h-4 w-4" aria-hidden />
            XML
          </Button>
        </a>
        {gzipUrl && (
          <a href={gzipUrl} className="inline-flex">
            <Button variant="outline" size="sm" type="button">
              <Download className="h-4 w-4" aria-hidden />
              .gz
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
}

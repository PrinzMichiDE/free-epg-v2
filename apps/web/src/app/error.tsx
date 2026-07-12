"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="page-shell py-24 flex flex-col items-center text-center max-w-lg mx-auto">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--warning-muted)] text-[var(--warning)] mb-6">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight mb-3">
        {t("error.page.title")}
      </h1>
      <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
        {t("error.page.desc")}
      </p>
      <Button onClick={() => reset()}>{t("common.retry")}</Button>
    </div>
  );
}

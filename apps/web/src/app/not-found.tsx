"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="page-shell py-24 flex flex-col items-center text-center max-w-lg mx-auto">
      <p className="text-6xl font-semibold text-[var(--muted-foreground)]/30 mb-4 tabular-nums">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight mb-3">
        {t("error.notFound.title")}
      </h1>
      <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
        {t("error.notFound.desc")}
      </p>
      <Link href="/">
        <Button>{t("common.home")}</Button>
      </Link>
    </div>
  );
}

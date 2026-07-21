"use client";

import Link from "next/link";
import { AMAZON_SUPPORT_URL } from "@/lib/site";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function AmazonSupportBanner() {
  const { t } = useI18n();

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
      <div className="page-shell py-2">
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] text-center sm:text-left">
          {t("donate.banner.message")}{" "}
          <Link
            href={AMAZON_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-[var(--foreground)] underline underline-offset-4 decoration-[var(--border)] hover:decoration-[var(--accent)] transition-colors"
          >
            {t("donate.banner.cta")}
          </Link>
        </p>
      </div>
    </div>
  );
}

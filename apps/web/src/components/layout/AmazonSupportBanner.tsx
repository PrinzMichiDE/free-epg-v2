"use client";

import Link from "next/link";
import { Gift, ExternalLink } from "lucide-react";
import { AMAZON_SUPPORT_URL } from "@/lib/site";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function AmazonSupportBanner() {
  const { t } = useI18n();

  return (
    <div className="border-b border-[#FF9900]/25 bg-gradient-to-r from-[#FF9900]/10 via-[#FF9900]/5 to-transparent">
      <div className="page-shell py-2.5 sm:py-3">
        <Link
          href={AMAZON_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-wrap items-center justify-center sm:justify-between gap-2 sm:gap-4 text-sm"
        >
          <span className="inline-flex items-center gap-2 text-[var(--foreground)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF9900]/15 text-[#FF9900] shrink-0">
              <Gift className="h-4 w-4" aria-hidden />
            </span>
            <span>{t("donate.banner.message")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#FF9900] group-hover:underline underline-offset-4">
            {t("donate.banner.cta")}
            <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </span>
        </Link>
      </div>
    </div>
  );
}

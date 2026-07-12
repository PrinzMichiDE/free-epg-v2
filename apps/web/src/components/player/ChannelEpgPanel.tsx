"use client";

import { useEffect, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { ChannelEpgProgramme, ChannelEpgResponse } from "@/lib/player/channel-epg";

interface ChannelEpgPanelProps {
  tvgId: string;
  channelTitle: string;
  className?: string;
}

function formatTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(new Date(iso));
}

function formatTimeRange(start: string, stop: string, locale: string): string {
  return `${formatTime(start, locale)} – ${formatTime(stop, locale)}`;
}

function programmeProgress(start: string, stop: string): number {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(stop).getTime();
  if (e <= s) return 0;
  return Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
}

function ProgrammeRow({
  programme,
  locale,
  highlight,
}: {
  programme: ChannelEpgProgramme;
  locale: string;
  highlight?: boolean;
}) {
  return (
    <li
      className={cn(
        "rounded-lg px-3 py-2.5",
        highlight ? "bg-[var(--primary)]/10 border border-[var(--primary)]/20" : "bg-[var(--surface-muted)]/60"
      )}
    >
      <p className="text-xs text-[var(--muted-foreground)] tabular-nums">
        {formatTimeRange(programme.start, programme.stop, locale)}
      </p>
      <p className={cn("font-medium mt-0.5", highlight ? "text-[var(--foreground)]" : "text-sm")}>
        {programme.title}
      </p>
      {programme.description && (
        <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 leading-relaxed">
          {programme.description}
        </p>
      )}
    </li>
  );
}

export function ChannelEpgPanel({ tvgId, channelTitle, className }: ChannelEpgPanelProps) {
  const { t, locale } = useI18n();
  const [epg, setEpg] = useState<ChannelEpgResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const intlLocale = locale === "de" ? "de-DE" : locale;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(`/api/channels/${encodeURIComponent(tvgId)}`);
        if (!res.ok) throw new Error("epg load failed");
        const data = (await res.json()) as ChannelEpgResponse;
        if (!cancelled) setEpg(data);
      } catch {
        if (!cancelled) setEpg({ channel: null, current: null, upcoming: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [tvgId]);

  useEffect(() => {
    if (!epg?.current) {
      setProgress(0);
      return;
    }

    const update = () => {
      setProgress(programmeProgress(epg.current!.start, epg.current!.stop));
    };
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [epg?.current]);

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 flex items-center gap-3 text-[var(--muted-foreground)]", className)}>
        <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
        <span className="text-sm">{t("player.epg.loading")}</span>
      </div>
    );
  }

  const hasData = epg?.current || (epg?.upcoming.length ?? 0) > 0;

  return (
    <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[var(--accent)] shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {t("player.epg.title")}
          </p>
          <p className="font-semibold tracking-tight truncate">{channelTitle}</p>
        </div>
      </div>

      {!hasData && (
        <p className="p-4 text-sm text-[var(--muted-foreground)]">{t("player.epg.noData")}</p>
      )}

      {epg?.current && (
        <div className="p-4 border-b border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-2">
            {t("player.epg.now")}
          </p>
          <p className="font-semibold text-lg tracking-tight">{epg.current.title}</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 tabular-nums">
            {formatTimeRange(epg.current.start, epg.current.stop, intlLocale)}
          </p>
          {epg.current.description && (
            <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed line-clamp-3">
              {epg.current.description}
            </p>
          )}
          <div className="mt-3 h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {epg && epg.upcoming.length > 0 && (
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
            {t("player.epg.next")}
          </p>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {epg.upcoming.slice(0, 8).map((programme) => (
              <ProgrammeRow
                key={programme.id}
                programme={programme}
                locale={intlLocale}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

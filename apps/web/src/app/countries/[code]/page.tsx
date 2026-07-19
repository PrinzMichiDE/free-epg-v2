import Link from "next/link";
import { EpgFeedsPanel } from "@/components/epg/EpgFeedsPanel";
import { CountryFlag } from "@/components/country/CountryFlag";
import { getCountryName } from "@/lib/countries";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { notFound } from "next/navigation";
import { CountryChannelsSection } from "./CountryChannelsSection";
import { NowPlayingSection } from "@/components/country/NowPlayingSection";

export const dynamic = "force-dynamic";

export default async function CountryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { code } = await params;
  const { page: pageParam } = await searchParams;
  const cc = code.toUpperCase();

  if (!EPG_PW_COUNTRIES.includes(cc)) {
    notFound();
  }

  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  return (
    <div className="page-shell py-10 sm:py-14">
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <CountryFlag code={cc} size="lg" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {getCountryName(cc)}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 font-mono text-sm">
              {cc}
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
          <EpgFeedsPanel countryCode={code} />
        </div>

        <div className="lg:col-span-3">
          <NowPlayingSection countryCode={cc} />
          <CountryChannelsSection code={code} countryCode={cc} page={page} />
        </div>
      </div>
    </div>
  );
}

import { getNowPlayingByCountry } from "@/lib/programmes";
import { NowPlayingSectionClient } from "./NowPlayingSectionClient";

interface NowPlayingSectionProps {
  countryCode: string;
}

export async function NowPlayingSection({ countryCode }: NowPlayingSectionProps) {
  const cc = countryCode.toUpperCase();
  let programmes: Awaited<ReturnType<typeof getNowPlayingByCountry>> = [];

  try {
    programmes = await getNowPlayingByCountry(cc, 8);
  } catch {
    programmes = [];
  }

  if (programmes.length === 0) {
    return null;
  }

  return <NowPlayingSectionClient countryCode={cc} programmes={programmes} />;
}

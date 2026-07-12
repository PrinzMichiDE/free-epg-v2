import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("de-DE").format(n);
}

export function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d));
}

export const BASE_URL =
  process.env.NEXTAUTH_URL ?? "https://free-epg.de";

export function xmlUrl(country: string): string {
  return `${BASE_URL}/api/epg/${country.toLowerCase()}.xml`;
}

export function xmlGzipUrl(country: string): string {
  return `${BASE_URL}/api/epg/${country.toLowerCase()}.xml.gz`;
}

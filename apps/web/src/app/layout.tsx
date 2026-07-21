import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { AmazonSupportBanner } from "@/components/layout/AmazonSupportBanner";
import { Footer } from "@/components/layout/Footer";
import { FooterVersion } from "@/components/layout/FooterVersion";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-ibm-plex-serif",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreeEPG — Weltweites EPG als XMLTV",
  description:
    "Kostenlose weltweite EPG-Daten im XMLTV-Format für tausende TV-Sender. Self-hosted, Open Source.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col antialiased">
        <I18nProvider>
          <Header />
          <AmazonSupportBanner />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer versionSlot={<FooterVersion />} />
        </I18nProvider>
      </body>
    </html>
  );
}

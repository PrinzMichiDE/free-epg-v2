import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { AmazonSupportBanner } from "@/components/layout/AmazonSupportBanner";
import { Footer } from "@/components/layout/Footer";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
    <html lang="de" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-dvh flex flex-col antialiased">
        <I18nProvider>
          <Header />
          <AmazonSupportBanner />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}

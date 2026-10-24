import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { I18nProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bahibar.com"),
  title: {
    default: "BahiBar — Gym records, sorted.",
    template: "%s | BahiBar",
  },
  description:
    "Safe, mobile-friendly digital gym register and fee management designed for local gym owners. Track memberships, calculate dues, send instant WhatsApp fee receipts, and eliminate paper registers.",
  applicationName: "BahiBar",
  keywords: [
    "gym management software",
    "digital gym register",
    "gym fee collection app",
    "gym member tracker",
    "fitness club ledger",
    "BahiBar gym software India",
    "WhatsApp gym receipt generator",
    "gym renewal dues manager",
  ],
  authors: [{ name: "BahiBar Team" }],
  creator: "BahiBar",
  publisher: "BahiBar",
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/bahibar-icon.svg",
    apple: "/brand/bahibar-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BahiBar",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    url: "https://bahibar.com",
    siteName: "BahiBar",
    title: "BahiBar — Gym records, sorted.",
    description:
      "Safe, mobile-friendly digital gym register and fee management for local gym owners. Replace notebooks with automated dues, instant receipts, and zero headaches.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BahiBar — Gym records, sorted.",
    description:
      "Safe, mobile-friendly digital gym register and fee management for local gym owners. Eliminate paper register headaches.",
  },
};

export const viewport: Viewport = {
  themeColor: "#087FDB",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialLocale: Locale = "en";
  try {
    const cookieStore = await cookies();
    const langCookie = cookieStore.get("bahibar_lang")?.value;
    if (langCookie === "hi") {
      initialLocale = "hi";
    }
  } catch {}

  return (
    <html lang={initialLocale} className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
      </body>
    </html>
  );
}

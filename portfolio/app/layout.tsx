import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { site } from "../lib/content";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${site.name} — Portfolio`,
  description:
    "Ethan Zaruba-Walker translates between what people need and what technology systems can deliver.",
  metadataBase: new URL(site.canonical),
  alternates: { canonical: "/" },
  openGraph: {
    title: site.name,
    description:
      "People-centered systems design: discovery, architecture, delivery, and enablement.",
    url: site.canonical,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body style={{ fontFamily: "var(--font-sans), Outfit, sans-serif" }}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Hind, Roboto } from "next/font/google";
import "./globals.css";

// Both families ship real Devanagari and Latin glyphs, so Hindi and English share one voice.
const hind = Hind({
  variable: "--font-hind",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "caneup",
  description: "View sugarcane supply tickets, payments, calendar and survey for Uttar Pradesh cane growers.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1c46c8" },
    { media: "(prefers-color-scheme: dark)", color: "#08102b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hind.variable} ${roboto.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

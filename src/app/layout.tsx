import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CookieBanner } from "@/components/layout/cookie-banner";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const headingFont = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Korevante Studio - 50+ All-in-One AI, Video, Image, PDF & Dev Tools",
    template: "%s | Korevante Studio",
  },
  description:
    "Premium all-in-one SaaS platform providing 50+ production-ready AI, Image, Video, PDF, Content Writing, and Developer productivity tools. Start your 7-day free trial today.",
  keywords: [
    "AI Tools", "Image Editor", "Video Compressor", "PDF Merge",
    "Background Remover", "AI Content Writer", "Korevante Studio", "SaaS",
  ],
  authors: [{ name: "Korevante Studio Team" }],
  creator: "Korevante Studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://korevante.com",
    title: "Korevante Studio - 50+ All-in-One Tools Suite",
    description: "Premium SaaS platform with 50+ AI, Image, Video, PDF, and Productivity tools. 7-day free trial included.",
    siteName: "Korevante Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korevante Studio - 50+ Tools in One Subscription",
    description: "Modern, fast, and secure suite for creators, developers, and businesses.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sansFont.variable} ${headingFont.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "AI Data Insights",
    template: "%s | AI Data Insights",
  },
  description:
    "Transform your spreadsheets into actionable insights with AI-powered analysis",
  keywords: [
    "AI",
    "data analysis",
    "spreadsheet",
    "insights",
    "business intelligence",
  ],
  authors: [{ name: "AI Data Insights Team" }],
  creator: "AI Data Insights",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "AI Data Insights",
    title: "AI Data Insights",
    description:
      "Transform your spreadsheets into actionable insights with AI-powered analysis",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Data Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Data Insights",
    description:
      "Transform your spreadsheets into actionable insights with AI-powered analysis",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-neutral-50 font-sans antialiased dark:bg-neutral-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

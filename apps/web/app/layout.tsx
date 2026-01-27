import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import ConfigureAmplify from "@/lib/cognito/cognito";
import TansTackQueryGlobal from "@/infraestructure/Tans-Tack-Query/TansTackQuery.global";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://tu-dominio-real.com";

const keywords = [
  "uptime monitoring",
  "server monitoring",
  "website checker",
  "monitoreo de servidores",
  "comprobador de sitios web",
  "alertas de downtime",
  "status page",
  "website availability",
  "server health check",
  "ping monitoring",
  "website performance",
  "incident management",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Server Check — Professional Uptime Monitoring",
    template: "%s | Server Check"
  },
  description: "Monitor your servers and websites 24/7. Get instant alerts when your site goes down, detailed analytics, and uptime reports. Start monitoring for free today.",
  keywords: keywords.join(", "),
  applicationName: "Server Check",
  authors: [{ name: "Server Check Team" }],
  creator: "Server Check",
  publisher: "Server Check",

  openGraph: {
    title: "Server Check — Professional Uptime Monitoring",
    description: "Monitor your servers and websites 24/7. Get instant alerts when your site goes down.",
    url: siteUrl,
    siteName: "Server Check",
    locale: "en_US",
    alternateLocale: ["es_ES"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Server Check - Professional Uptime Monitoring",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Server Check — Professional Uptime Monitoring",
    description: "Monitor your servers and websites 24/7. Get instant alerts when your site goes down.",
    images: ["/og-image.png"],
    creator: "@servercheck", 
  },

  alternates: {
    canonical: siteUrl,
  },

  verification: {
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <TansTackQueryGlobal>
          <ConfigureAmplify />
          {children}
        </TansTackQueryGlobal>
      </body>
    </html>
  );
}
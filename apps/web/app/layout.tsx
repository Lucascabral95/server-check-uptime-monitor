import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "@/lib/cognito/cognito";
import TansTackQueryGlobal from "@/infraestructure/Tans-Tack-Query/TansTackQuery.global";

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

export const metadata: Metadata = {
  title: "Server Check — Uptime Monitor",
  description: "Professional uptime monitoring dashboard",
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

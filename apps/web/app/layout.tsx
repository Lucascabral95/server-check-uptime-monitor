import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "@/lib/cognito/cognito";
import TansTackQueryGlobal from "@/infraestructure/Tans-Tack-Query/TansTackQuery.global";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Server Check — Uptime Monitor",
  description: "Professional uptime monitoring dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ margin: 0, padding: 0, height: "100%" }}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ margin: 0, padding: 0, height: "100%", overflow: "hidden" }}
      >
        <TansTackQueryGlobal>
          <ConfigureAmplify />
          {children}
        </TansTackQueryGlobal>
      </body>
    </html>
  );
}

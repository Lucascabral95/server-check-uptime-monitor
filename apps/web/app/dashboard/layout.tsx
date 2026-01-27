import StructureDashboard from "@/presentation/components/Structures/Dashboard/StructureDashboard";
import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_URL_FRONTEND || "https://tu-dominio-real.com";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage and monitor your servers. View uptime statistics, incident history, and performance metrics in real-time.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  alternates: {
    canonical: `${siteUrl}/dashboard`,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
    <StructureDashboard>
        {children}
    </StructureDashboard>
    )
}
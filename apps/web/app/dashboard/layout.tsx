import StructureDashboard from "@/presentation/components/Structures/Dashboard/StructureDashboard";
import { Metadata } from "next";

export const metadata: Metadata= {
    title: "Dashboard | Server Check",
    description: "Detalles del seguimiento de mis servidores",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <StructureDashboard>
        {children}
        </StructureDashboard>;
}
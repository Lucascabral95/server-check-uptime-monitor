import DashboardHome from "./DashboardHomeView";
import { constructMetadata } from "@/lib/utils/seo";

export const metadata = constructMetadata({
  title: "Mis Monitoreos",
  description: "Panel de control principal para gestionar el uptime de tus servidores.",
});

const DashboardHomePage = () => {
  return <DashboardHome />;
};

export default DashboardHomePage;
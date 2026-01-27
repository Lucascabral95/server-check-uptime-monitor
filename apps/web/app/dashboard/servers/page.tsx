import { constructMetadata } from '@/lib/utils/seo';
import ServerStatusDashboardView from './ServerStatusDashboardView';

export const metadata = constructMetadata({
  title: "Resumen de Estado", 
  description: "Vista general del estado de todos tus servidores monitoreados.",
  noIndex: true, 
});

const ServerStatusDashboardPage = () => {
  return (
    <ServerStatusDashboardView />
  )
}

export default ServerStatusDashboardPage;
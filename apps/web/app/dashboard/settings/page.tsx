import { constructMetadata } from '@/lib/utils/seo';
import SettingsDashboardView from './SettingsDashboardView';

export const metadata = constructMetadata({
  title: "Historial de Incidentes",
  description: "Consulta el historial detallado de caídas y eventos de tus servidores.",
  noIndex: true, 
});

const SettingsDashboardPage = () => {
  return (
    <SettingsDashboardView />
  )
}

export default SettingsDashboardPage;
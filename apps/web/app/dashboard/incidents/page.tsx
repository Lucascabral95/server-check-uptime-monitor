import { constructMetadata } from '@/lib/utils/seo';
import IncidentsDashboardView from './IncidentsDashboardView'

export const metadata = constructMetadata({
  title: "Historial de Incidentes",
  description: "Registro detallado de todos los incidentes y caídas de servidores detectados.",
  noIndex: true, 
});

const IncidentsDashboardPage = () => {
  return (
    <IncidentsDashboardView />
  )
}

export default IncidentsDashboardPage;
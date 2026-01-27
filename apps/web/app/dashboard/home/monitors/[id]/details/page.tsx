import { constructMetadata } from '@/lib/utils/seo';
import MonitorsDetailsByIdView from './MonitorsDetailsByIdView'

export const metadata = constructMetadata({
  title: "Detalles del Monitor",
  description: "Métricas en tiempo real, estadísticas de uptime e historial de incidentes del monitor.",
  noIndex: true, 
});

const MonitorsDetailsByIdPage = () => {
  return (
    <MonitorsDetailsByIdView />
  )
}

export default MonitorsDetailsByIdPage

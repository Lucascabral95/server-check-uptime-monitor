import { constructMetadata } from '@/lib/utils/seo';
import EditMonitorView from './EditMonitorView'

export const metadata = constructMetadata({
  title: "Editar Monitor",
  description: "Modifica la configuración de tu monitor.",
  noIndex: true,
});

const EditMonitorPage = () => {
  return (
    <EditMonitorView />
  )
}

export default EditMonitorPage

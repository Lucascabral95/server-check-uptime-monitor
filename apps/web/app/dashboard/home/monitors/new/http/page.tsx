import MonitorsNewHttpView from './MonitorsNewHttpView'
import { constructMetadata } from '@/lib/utils/seo';

export const metadata = constructMetadata({
  title: "Nuevo Monitor HTTP",
  description: "Configura un nuevo monitor para supervisar el estado de tu sitio web o API.",
  noIndex: true, 
});

const MonitorsNewHttpPage = () => {
  return (
    <MonitorsNewHttpView />
  )
}

export default MonitorsNewHttpPage

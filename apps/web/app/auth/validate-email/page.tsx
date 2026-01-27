import { constructMetadata } from '@/lib/utils/seo';
import ValidateEmailView from './ValidateEmailView'

export const metadata = constructMetadata({
  title: "Verificar Email",
  description: "Verifica tu dirección de correo para activar tu cuenta.",
  noIndex: true, 
});

const ValidateEmailPagge = () => {
  return (
    <ValidateEmailView />
  )
}

export default ValidateEmailPagge;
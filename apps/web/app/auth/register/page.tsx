import { constructMetadata } from '@/lib/utils/seo';
import RegisterView from './RegisterView'

export const metadata = constructMetadata({
  title: "Crear Cuenta",
  description: "Crea tu cuenta gratis y empezá a monitorear tus servidores en tiempo real.",
});

const RegisterPage = () => {
  return (
    <RegisterView />
  )
}

export default RegisterPage;
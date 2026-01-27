import { constructMetadata } from "@/lib/utils/seo";
import LoginView from "./LoginView";

export const metadata = constructMetadata({
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Server Check para monitorear tus servidores.",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginView />;
}
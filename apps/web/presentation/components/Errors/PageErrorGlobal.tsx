'use client'

import Link from "next/link";
import { FiHome, FiArrowLeft } from "react-icons/fi";

import { useAuth } from "@/lib/hooks";

import "./PageErrorGlobal.scss";

const PageErrorGlobal = () => {
   const { isAuthenticated } = useAuth();

  return (
    <div className="page-error-global">
      <div className="page-error-global__content">
        <div className="page-error-global__icon">404</div>

        <h1 className="page-error-global__title">Página no encontrada</h1>
        <p className="page-error-global__description">
          La página que buscas no existe o ha sido movida.
        </p>

        <div className="page-error-global__actions">
          <Link href="/" className="page-error-global__btn page-error-global__btn--primary">
            <FiHome />
            Ir al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="page-error-global__btn page-error-global__btn--secondary"
          >
            <FiArrowLeft />
            Volver atrás
          </button>
        </div>

        {!isAuthenticated &&
        <div className="page-error-global__links">
          <Link href="/">Inicio</Link>
          <span>·</span>
          <Link href="/auth/login">Iniciar sesión</Link>
          <span>·</span>
          <Link href="/auth/register">Registrarse</Link>
        </div>
        }
      </div>
    </div>
  );
};

export default PageErrorGlobal;

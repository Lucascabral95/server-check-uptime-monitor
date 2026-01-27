import Link from "next/link";
import { FiArrowRight, FiGithub } from "react-icons/fi";

import { SOCIAL_NETWORKS } from "@/infraestructure/constants";

export const CTASection = () => (
  <section className="cta-section">
    <div className="cta-container">
      <div className="cta-card">
        <div className="cta-content">
          <h2 className="cta-title">
            ¿Listo para monitorear tu infraestructura?
          </h2>

          <p className="cta-subtitle">
            Unite a más de 500 empresas que confían en ServerCheck
            para mantener sus sistemas operativos. Configurá tu
            primer monitor en menos de 2 minutos.
          </p>

          <div className="cta-buttons">
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Crear cuenta gratuita
              <FiArrowRight />
            </Link>

            <a
              href={SOCIAL_NETWORKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg">
              <FiGithub />
              Ver en GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

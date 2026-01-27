
import { FEATURES } from "@/infraestructure/constants";
import { FiZap } from "react-icons/fi";

export const FeaturesSection = () => (
  <section id="features" className="features-section">
    <div className="features-container">
      <div className="section-header">
        <div className="section-label">
          <FiZap />
          Características
        </div>

        <h2 className="section-title">
          Todo lo que necesitas para monitorear tu infraestructura
        </h2>

        <p className="section-subtitle">
          Herramientas profesionales diseñadas para equipos de ingeniería
          que necesitan fiabilidad, escala y visibilidad completa.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">
              <f.icon />
            </div>

            <h3 className="feature-title">
              {f.title}
            </h3>

            <p className="feature-description">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

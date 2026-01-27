"use client";

import Link from "next/link";
import {
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiZap,
} from "react-icons/fi";

export const HeroSection = () => {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <FiCheckCircle />
            Monitoreo en tiempo real
          </div>

          <h1 className="hero-title">
            Monitoreo de servidores{" "}
            <span className="highlight">para empresas</span>
          </h1>

          <p className="hero-subtitle">
            Detectá tiempos de inactividad antes que tus usuarios.
            Comprobaciones automáticas, alertas instantáneas y analytics
            avanzados en una plataforma enterprise-grade.
          </p>

          <div className="hero-cta">
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Comenzar prueba gratuita
              <FiArrowRight />
            </Link>

            <button
              onClick={() => scrollTo("features")}
              className="btn btn-secondary btn-lg"
            >
              Ver características
            </button>
          </div>

          <div className="hero-trust">
            <span className="trust-text">
              Confían en nosotros más de 500 empresas
            </span>

            <div className="trust-icons">
              <FiCheckCircle />
              <FiShield />
              <FiZap />
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-dot red" />
              <div className="preview-dot yellow" />
              <div className="preview-dot green" />
            </div>

            <div className="preview-content">
              <div className="preview-row w-75" />
              <div className="preview-row w-50" />

              {[1, 2].map(i => (
                <div key={i} className="preview-card">
                  <div className="preview-status" />
                  <div className="preview-text">
                    <div className="preview-line" />
                    <div className="preview-line" />
                  </div>
                </div>
              ))}

              <div className="preview-row w-60" />
              <div className="preview-row w-40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

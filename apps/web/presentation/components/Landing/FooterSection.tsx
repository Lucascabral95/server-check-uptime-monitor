import { FiActivity } from "react-icons/fi";

export const Footer = () => (
  <footer className="landing-footer">
    <div className="footer-container">
      <div className="footer-brand">
        <FiActivity />
        ServerCheck
      </div>

      <div className="footer-links">
        <a href="#features">Características</a>
        <a href="#metrics">Métricas</a>
        <a href="#">Documentación</a>
        <a href="#">Soporte</a>
      </div>

      <div className="footer-copy">
        © 2026 ServerCheck. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

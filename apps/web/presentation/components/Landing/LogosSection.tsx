import { COMPANY_LOGOS } from "@/infraestructure/constants";

export const LogosSection = () => (
  <section className="logos-section">
    <div className="logos-container">
      <div className="logos-label">
        EMPRESAS QUE CONFÍAN EN NOSOTROS
      </div>

      <div className="logos-grid">
        {COMPANY_LOGOS.map((company, index) => (
          <div key={index} className="logo-item">
            <company.icon />
            <span>{company.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

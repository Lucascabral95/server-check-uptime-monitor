import { METRICS } from "@/infraestructure/constants";

export const MetricsSection = () => (
  <section id="metrics" className="metrics-section">
    <div className="metrics-container">
      <div className="metrics-grid">
        {METRICS.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-value">
              {metric.value}
            </div>
            <div className="metric-label">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

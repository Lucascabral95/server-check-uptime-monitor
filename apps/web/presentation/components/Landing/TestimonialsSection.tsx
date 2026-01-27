
import { FiTrendingUp } from "react-icons/fi";

import { TESTIMONIALS } from "@/infraestructure/constants";

export const TestimonialsSection = () => (
  <section id="testimonials" className="testimonials-section">
    <div className="testimonials-container">
      <div className="section-header">
        <div className="section-label">
          <FiTrendingUp />
          Testimonios
        </div>
        <h2>Lo que dicen nuestros clientes</h2>
      </div>

      <div className="testimonials-grid">
        {TESTIMONIALS.map((t, index) => (
          <div key={index} className="testimonial-card">
            <p className="testimonial-quote">
              {t.quote}
            </p>

            <div className="testimonial-author">
              <div className="author-avatar">
                <t.avatar />
              </div>

              <div className="author-info">
                <div className="author-name">
                  {t.author}
                </div>
                <div className="author-title">
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

"use client";

import { useState } from "react";
import { CreateUptimeDto, MonitorType } from "@/infraestructure/interfaces";
import "./MonitorWizard.scss";

interface Props {
  onSubmit: (monitor: CreateUptimeDto) => void;
  onCancel?: () => void;
  submitting?: boolean;
}

const TYPE_LABELS: Record<MonitorType, string> = {
  [MonitorType.HTTP]: "HTTP / API",
  [MonitorType.SSL]: "SSL / TLS",
  [MonitorType.HEARTBEAT]: "Heartbeat",
};

export default function MonitorWizard({ onSubmit, onCancel, submitting = false }: Props) {
  const [type, setType] = useState<MonitorType>(MonitorType.HTTP);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://");
  const [frequency, setFrequency] = useState(60);
  const [method, setMethod] = useState("GET");
  const [expectedStatus, setExpectedStatus] = useState("200");
  const [alertDays, setAlertDays] = useState(30);
  const [heartbeatInterval, setHeartbeatInterval] = useState(300);
  const [heartbeatGrace, setHeartbeatGrace] = useState(60);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const monitor: CreateUptimeDto = {
      name,
      url,
      frequency,
      monitorType: type,
    };
    if (type === MonitorType.HTTP)
      monitor.config = {
        http: {
          method,
          expectedStatusCodes: expectedStatus
            .split(",")
            .map(Number)
            .filter(Boolean),
        },
      };
    if (type === MonitorType.SSL)
      monitor.config = { ssl: { alertBeforeDays: alertDays } };
    if (type === MonitorType.HEARTBEAT) {
      monitor.heartbeatIntervalSeconds = heartbeatInterval;
      monitor.heartbeatGraceSeconds = heartbeatGrace;
    }
    onSubmit(monitor);
  };

  return (
    <div className="wiz-grid">
      <form className="card form-card monitor-wizard" onSubmit={submit}>
        <h2 className="form-sec-title">Tipo de monitor</h2>
        <div className="segmented" role="tablist">
          {(Object.values(MonitorType) as MonitorType[]).map((option) => (
            <button
              type="button"
              key={option}
              role="tab"
              aria-selected={type === option}
              className={`seg-item ${type === option ? "active" : ""}`}
              onClick={() => setType(option)}
            >
              {TYPE_LABELS[option]}
            </button>
          ))}
        </div>

        <div className="fg">
          <label htmlFor="wizard-name">Nombre</label>
          <input
            id="wizard-name"
            required
            placeholder="ej. API de checkout"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="fg">
          <label htmlFor="wizard-url">
            {type === MonitorType.HEARTBEAT ? "URL descriptiva" : "URL"}
          </label>
          <input
            id="wizard-url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>

        <div className="fg">
          <label htmlFor="wizard-frequency">Intervalo (segundos)</label>
          <input
            id="wizard-frequency"
            type="number"
            min={60}
            value={frequency}
            onChange={(event) => setFrequency(Number(event.target.value))}
          />
        </div>

        {type === MonitorType.HTTP && (
          <>
            <div className="divider" />
            <div className="form-sec-title">Aserciones HTTP</div>
            <div className="field-grid">
              <div className="fg">
                <label htmlFor="wizard-method">Método</label>
                <select
                  id="wizard-method"
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                >
                  {["GET", "HEAD", "POST", "PUT", "PATCH"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="fg">
                <label htmlFor="wizard-expected-status">Códigos esperados</label>
                <input
                  id="wizard-expected-status"
                  value={expectedStatus}
                  onChange={(event) => setExpectedStatus(event.target.value)}
                />
                <span className="hint">Separados por coma</span>
              </div>
            </div>
          </>
        )}

        {type === MonitorType.SSL && (
          <div className="fg">
            <label htmlFor="wizard-alert-days">Alertar antes de (días)</label>
            <input
              id="wizard-alert-days"
              type="number"
              min={1}
              max={90}
              value={alertDays}
              onChange={(event) => setAlertDays(Number(event.target.value))}
            />
          </div>
        )}

        {type === MonitorType.HEARTBEAT && (
          <div className="field-grid">
            <div className="fg">
              <label htmlFor="wizard-heartbeat-interval">Intervalo esperado</label>
              <input
                id="wizard-heartbeat-interval"
                type="number"
                min={10}
                value={heartbeatInterval}
                onChange={(event) =>
                  setHeartbeatInterval(Number(event.target.value))
                }
              />
            </div>
            <div className="fg">
              <label htmlFor="wizard-heartbeat-grace">Gracia</label>
              <input
                id="wizard-heartbeat-grace"
                type="number"
                min={0}
                value={heartbeatGrace}
                onChange={(event) =>
                  setHeartbeatGrace(Number(event.target.value))
                }
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            Crear monitor
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="card preview-card">
        <div className="preview-label">Vista previa</div>
        <div className="preview-row">
          <span className="pv-dot" />
          <div>
            <div className="pv-name">{name || "Nombre del monitor"}</div>
            <div className="pv-meta">{url}</div>
          </div>
        </div>
        <p className="preview-note">
          Así se verá en tu lista de monitores. Empieza en estado{" "}
          <b>Pending</b> hasta el primer chequeo.
        </p>
      </div>
    </div>
  );
}

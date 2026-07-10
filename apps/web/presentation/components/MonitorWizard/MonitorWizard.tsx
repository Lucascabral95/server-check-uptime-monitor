"use client";

import { useState } from "react";
import { CreateUptimeDto, MonitorType } from "@/infraestructure/interfaces";
import "./MonitorWizard.scss";

interface Props {
  onSubmit: (monitor: CreateUptimeDto) => void;
  submitting?: boolean;
}

export default function MonitorWizard({ onSubmit, submitting = false }: Props) {
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
    <form className="monitor-wizard" onSubmit={submit}>
      <h2>Crear monitor profesional</h2>
      <label>
        Tipo
        <select
          value={type}
          onChange={(event) => setType(event.target.value as MonitorType)}
        >
          <option value={MonitorType.HTTP}>HTTP / API</option>
          <option value={MonitorType.SSL}>SSL / TLS</option>
          <option value={MonitorType.HEARTBEAT}>Heartbeat</option>
        </select>
      </label>
      <label>
        Nombre
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label>
        {type === MonitorType.HEARTBEAT ? "URL descriptiva" : "URL"}
        <input
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
      </label>
      <label>
        Intervalo (segundos)
        <input
          type="number"
          min={60}
          value={frequency}
          onChange={(event) => setFrequency(Number(event.target.value))}
        />
      </label>
      {type === MonitorType.HTTP && (
        <fieldset>
          <legend>Aserciones HTTP</legend>
          <label>
            Método
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {["GET", "HEAD", "POST", "PUT", "PATCH"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Códigos esperados
            <input
              value={expectedStatus}
              onChange={(event) => setExpectedStatus(event.target.value)}
            />
          </label>
        </fieldset>
      )}
      {type === MonitorType.SSL && (
        <label>
          Alertar antes de (días)
          <input
            type="number"
            min={1}
            max={90}
            value={alertDays}
            onChange={(event) => setAlertDays(Number(event.target.value))}
          />
        </label>
      )}
      {type === MonitorType.HEARTBEAT && (
        <fieldset>
          <legend>Heartbeat</legend>
          <label>
            Intervalo esperado
            <input
              type="number"
              min={10}
              value={heartbeatInterval}
              onChange={(event) =>
                setHeartbeatInterval(Number(event.target.value))
              }
            />
          </label>
          <label>
            Gracia
            <input
              type="number"
              min={0}
              value={heartbeatGrace}
              onChange={(event) =>
                setHeartbeatGrace(Number(event.target.value))
              }
            />
          </label>
        </fieldset>
      )}
      <button type="submit" disabled={submitting}>
        Crear monitor
      </button>
    </form>
  );
}

'use client';

import { GetIncidentsByUserIdInterface } from '@/infraestructure/interfaces';
import './TableIncidents.scss';

interface TableIncidentsProps {
    data: GetIncidentsByUserIdInterface;
}

const IncidentsTable = ({ data }: TableIncidentsProps) => {
  return (
    <div className="incidents-table">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Monitor</th>
              <th>Causa</th>
              <th>Cantidad de Checks</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Duración</th>
              <th>Visibilidad</th>
            </tr>
          </thead>

          <tbody>
            {data?.incidents.map((row, index) => (
              <tr key={index}>
                <td>
                  <span className={`status ${row.status === "RESOLVED" ? "resolved" : "ongoing"}`}>
                    <span className="dot" />
                    {row.status === "RESOLVED" ? "Resuelto" : "En curso"}
                  </span>
                </td>

                <td className="monitor">{row.monitorName}</td>

                <td>
                  <div className="cause">
                    <span className={`code code-${row.monitorStatus}`}>
                      {row.monitorStatus}
                    </span>
                    <span className="text">{row.firstError}</span>
                  </div>
                </td>

                <td className="comments">{row.affectedChecks}</td>
                <td className="date">{new Date(row.startTime).toISOString().split("T")[0]}</td>
                <td className="date">
                  {row.endTime ? new Date(row.endTime).toISOString().split("T")[0] : "En curso"}
                </td>
                <td className="duration">{row.duration}</td>

                <td className="visibility">
                  <span className="vis-badge">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentsTable;

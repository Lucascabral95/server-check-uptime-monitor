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
                  <span className="status resolved"
                  style={{ color: row.status === "RESOLVED" ? "#2ED071" : "red" }}
                  > 
                    {row.status} 
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
                <td className="date">{new Date(row.endTime).toISOString().split("T")[0]}</td>
                <td className="duration">{row.duration}</td>

                <td className="visibility">
                  <strong>{row.status}</strong>
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

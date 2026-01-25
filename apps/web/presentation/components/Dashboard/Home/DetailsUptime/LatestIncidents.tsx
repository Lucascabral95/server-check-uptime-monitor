'use client';

import { GetPingLoginterface } from '@/infraestructure/interfaces';
import './LatestIncidents.scss';

interface LatestIncidentsProps {
    errorLogs: GetPingLoginterface[];
    handleMoreIncidents: () => void;
    countLimitIncidents: number;
}

const LatestIncidents = ({ errorLogs, handleMoreIncidents, countLimitIncidents }: LatestIncidentsProps) => {
  return (
    <div className="latest-incidents">
      <div className="header">
        <h3>Incidentes recientes.</h3>

        {/* <button className="export-btn">
          Exportar logs
        </button> */}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Estado </th>
              <th>Causa raíz</th>
              <th>Inicio</th>
              <th>Duración</th>
            </tr>
          </thead>

          <tbody>
            {errorLogs.slice(0, countLimitIncidents).map(log => (
              <tr key={log.id}>
                  <td>
                    <div className="status resolved">
                      <span className="dot" />
                      Error
                    </div>
                  </td>

                  <td>
                    <div className="cause">
                      <span className="code">{log.statusCode}</span>
                      <span className="text">
                        {log.error ?? 'Error desconocido'}
                      </span>
                    </div>
                  </td>

                  <td className="started">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="duration">
                    {log.durationMs} ms
                  </td>
                </tr>
              ))}

            {errorLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
                  No hay incidentes registrados
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {errorLogs.length > countLimitIncidents && (
        <button className="load-more" onClick={handleMoreIncidents}>
          Cargar más incidentes
        </button>
      )}
    </div>
  );
};

export default LatestIncidents;

'use client';

import { GetStatsLogsByUptimeIdInterface } from '@/infraestructure/interfaces';
import { colorByPercentage, formatInterval } from '@/presentation/utils';

import './MonitorStatsOverview.scss';

interface MonitorStatsOverviewProps {
    monitor: GetStatsLogsByUptimeIdInterface;
    stats24h: boolean[];
}

const MonitorStatsOverview = ({ monitor, stats24h }: MonitorStatsOverviewProps) => {

  return (
    <div className="monitor-stats-overview">
      <div className="stats-row">
        <div className="stat-card">
          <span className="label">Estado actual</span>
          <span 
           style={{
            color: monitor?.monitor?.status === "UP" ? "#28a745" : "#dc3545",
           }}
          className="status up"> 
            {monitor?.monitor?.status}
             </span>
          <span className="sub">
            Actualmente {monitor?.monitor?.status}
          </span>
        </div>

        <div className="stat-card">
          <span className="label">Último chequeo</span>
          <span className="value"> {monitor?.monitor?.lastCheck.toLocaleString().split("T")[0]} </span>
          <span className="sub">Chequeado cada {formatInterval(monitor?.monitor?.frequency)}</span>
        </div>

        <div className="stat-card wide">
          <div className="row-between">
            <span className="label">Últimas 24 horas</span>
            <span className="percentage"> {monitor?.stats?.last24Hours?.healthPercentage}% </span>
          </div>

          <div className="uptime-bars">
            {stats24h.map((isUp, i) => (
              <span key={i} className={`bar ${isUp ? 'up' : 'down'}`} />
            ))}
          </div>

          <span className="sub">
            {monitor?.stats?.last24Hours?.incidentCount} incidente/s, {monitor?.stats?.last24Hours?.downtimeFormatted} down
          </span>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="label">Últimas 24 horas</span>
          <span 
           style={{ color: colorByPercentage(monitor?.stats?.last24Hours?.healthPercentage) }}
          className="percentage down"> 
            {monitor?.stats?.last24Hours?.healthPercentage}% 
            </span>
          <span className="sub">
            {monitor?.stats?.last24Hours?.incidentCount} incidente/s, {monitor?.stats?.last24Hours?.downtimeFormatted} down
          </span>
        </div>

        <div className="stat-card">
          <span className="label">Últimos 7 dias</span>
          <span 
           style={{ color: colorByPercentage(monitor?.stats?.last7Days?.healthPercentage) }}
          className="percentage down"> 
            {monitor?.stats?.last7Days?.healthPercentage}% 
            </span>
          <span className="sub">
            {monitor?.stats?.last7Days?.incidentCount} incidente/s, {monitor?.stats?.last7Days?.downtimeFormatted} down
          </span>
        </div>

        <div className="stat-card">
          <span className="label">Últimos 30 dias</span>
          <span 
           style={{ color: colorByPercentage(monitor?.stats?.last30Days?.healthPercentage) }}
          className="percentage down"
          > 
            {monitor?.stats?.last30Days?.healthPercentage}% 
            </span>
          <span className="sub">
            {monitor?.stats?.last30Days?.incidentCount} incidente/s, {monitor?.stats?.last30Days?.downtimeFormatted} down
          </span>
        </div>

        <div className="stat-card">
          <span className="label">Últimos 365 dias</span>
          <span 
           style={{ color: colorByPercentage(monitor?.stats?.last365Days?.healthPercentage) }}
          className="percentage down"> 
            {monitor?.stats?.last365Days?.healthPercentage}%
             </span>
          <span className="sub">
            {monitor?.stats?.last365Days?.incidentCount} incidente/s, {monitor?.stats?.last365Days?.downtimeFormatted} down
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonitorStatsOverview;

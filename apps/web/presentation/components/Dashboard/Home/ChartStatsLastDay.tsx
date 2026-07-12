import StructureChartStats from '../../Structures/Dashboard/Home/StructureChartStats'
import { GetStatsUserInterface } from "@/infraestructure/interfaces";
import { porcentHealthy } from '@/presentation/utils';
import "./CardUptime.scss"

interface ChartStatsLastDayProps {
    statsUser: GetStatsUserInterface;
}

const ChartStatsLastDay = ({ statsUser }: ChartStatsLastDayProps) => {
       const healthyPercent = porcentHealthy(statsUser.totalMonitors, statsUser.up);

  return (
    <StructureChartStats>
        <div className="hours-card">
            <div className="hours-card-title">
                <p>Últimas 24 horas</p>
            </div>
            <div className="hours-card-body">
                <div className="hours-stat">
                    <span
                        className="hours-stat-value"
                        style={{ color: healthyPercent >= 50 ? "var(--color-up)" : "var(--color-down)" }}
                    >
                        {healthyPercent}%
                    </span>
                    <span className="hours-stat-label">Actividad general</span>
                </div>
                <div className="hours-stat">
                    <span
                        className="hours-stat-value"
                        style={{ color: statsUser.downLast24hCount > 0 ? "var(--color-down)" : "var(--color-text-primary)" }}
                    >
                        {statsUser.downLast24hCount}
                    </span>
                    <span className="hours-stat-label">Incidentes</span>
                </div>
                <div className="hours-stat">
                    <span className="hours-stat-value">{statsUser.pending}</span>
                    <span className="hours-stat-label">Pendientes</span>
                </div>
            </div>
        </div>
    </StructureChartStats>
  )
}

export default ChartStatsLastDay;

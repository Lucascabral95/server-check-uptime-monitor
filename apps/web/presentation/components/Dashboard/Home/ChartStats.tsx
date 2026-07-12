import StructureChartStats from "../../Structures/Dashboard/Home/StructureChartStats"
import { GetStatsUserInterface } from "@/infraestructure/interfaces";

import "./CardUptime.scss"

interface ChartStatsProps {
    statsUser: GetStatsUserInterface;
}

const ChartStats = ({ statsUser }: ChartStatsProps) => {
  const { up, down, totalMonitors } = statsUser;
  const other = Math.max(totalMonitors - up - down, 0);

  const upPct = totalMonitors > 0 ? (up / totalMonitors) * 100 : 0;
  const downPct = totalMonitors > 0 ? (down / totalMonitors) * 100 : 0;

  const donutGradient = `conic-gradient(var(--color-up) 0% ${upPct}%, var(--color-down) ${upPct}% ${upPct + downPct}%, var(--color-paused) ${upPct + downPct}% 100%)`;

  return (
    <StructureChartStats>
        <div className="donut-card">
            <div className="donut-card-title">
                <p>Estadísticas actuales</p>
            </div>
            <div className="donut-card-body">
                <div className="donut-visual" style={{ background: totalMonitors > 0 ? donutGradient : "var(--color-bg-inset)" }}>
                    <div className="donut-center">
                        <span className="donut-total">{totalMonitors}</span>
                        <span className="donut-total-label">Monitores</span>
                    </div>
                </div>
                <div className="donut-legend">
                    <div className="donut-legend-item">
                        <span className="dot dot-up" />
                        <span className="legend-label">Activos</span>
                        <span className="legend-value">{up}</span>
                    </div>
                    <div className="donut-legend-item">
                        <span className="dot dot-down" />
                        <span className="legend-label">Caídos</span>
                        <span className="legend-value">{down}</span>
                    </div>
                    <div className="donut-legend-item">
                        <span className="dot dot-paused" />
                        <span className="legend-label">Otros</span>
                        <span className="legend-value">{other}</span>
                    </div>
                </div>
            </div>
        </div>
    </StructureChartStats>
  )
}

export default ChartStats

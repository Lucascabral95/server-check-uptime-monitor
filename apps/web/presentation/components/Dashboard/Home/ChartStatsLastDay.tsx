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
        <div className="chart-stats-container">
                     <div className="title-chart">
                        <p> Últimas 24 horas. </p>
                     </div>
                     <div className="group-stats">
                        <div className="group">
                          <div className="number">
                            <p style={{ color: healthyPercent >= 50 ? "#3BD671" : "red" }}>  
                                {healthyPercent}% 
                                </p>
                          </div>
                          <div className="text">
                            <p> Actividad general </p>
                          </div>
                        </div>
                        <div className="group">
                          <div className="number">
                            <p style={{ color: statsUser.downLast24hCount > 0 ? "red" : "#ffffff" }}>
                                 {statsUser.downLast24hCount}
                                  </p>
                          </div>
                          <div className="text">
                            <p>Incidentes</p>
                          </div>
                        </div>
                     </div>
                </div>
    </StructureChartStats>
  )
}

export default ChartStatsLastDay;
import { MdCheckCircle } from "react-icons/md"

import StructureChartStats from "../../Structures/Dashboard/Home/StructureChartStats"
import { GetStatsUserInterface, Status } from "@/infraestructure/interfaces";
import { getStatusColor } from "@/presentation/utils";
import "./CardUptime.scss"

interface ChartStatsProps {
    statsUser: GetStatsUserInterface;
}

const ChartStats = ({ statsUser }: ChartStatsProps) => {
  return (
    <StructureChartStats>
        <div className="chart-stats-container">
             <div className="title-chart">
                <p> Estadísticas actuales </p>
             </div>
             <div className="icon-status">
                <MdCheckCircle 
                className="icon"
                 style={{ color: getStatusColor(statsUser.downLast24h.length > 0 ? Status.DOWN : Status.UP) }}
                  />
             </div>
             <div className="data-monitors">
                <div className="data">
                    <p 
                    style={{ color: statsUser.down > 0 ? "red" : "#ffffff" }}
                    className="number">{statsUser.down}</p>
                    <p className="text">Down</p>
                </div>
                <div className="data">
                    <p 
                    style={{ color: statsUser.up > 0 ? "#3BD671" : "#ffffff" }}
                    className="number">{statsUser.up}</p>
                    <p className="text">Up</p>
                </div>
                <div className="data">
                    <p 
                    style={{ color: statsUser.pending > 0 ? "yellow" : "#ffffff" }}
                    className="number">{statsUser.pending}</p>
                    <p className="text">Pendientes</p>
                </div>
             </div>
        </div>
    </StructureChartStats>
  )
}

export default ChartStats

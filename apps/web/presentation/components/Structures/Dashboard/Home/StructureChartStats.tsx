import React from "react"

import "./StructureChartStats.scss"

interface StructureChartStatsProps {
   children: React.ReactNode 
}

const StructureChartStats = ({ children }: StructureChartStatsProps) => {
  return (
    <div className="structure-chart-stats">
    <div className="structure-chart-stats-container">
      {children}
    </div>
    </div>
  )
}

export default StructureChartStats

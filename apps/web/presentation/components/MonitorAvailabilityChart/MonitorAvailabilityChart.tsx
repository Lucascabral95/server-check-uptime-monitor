"use client";

import { MonitorAggregateDto } from "@/infraestructure/interfaces";
import "./MonitorAvailabilityChart.scss";

export default function MonitorAvailabilityChart({
  data,
}: {
  data: MonitorAggregateDto[];
}) {
  const points = data
    .slice(-48)
    .map((item, index) => {
      const checks = item.checks || 1;
      const availability = (item.successes / checks) * 100;
      return `${(index / Math.max(data.slice(-48).length - 1, 1)) * 100},${100 - availability}`;
    })
    .join(" ");
  return (
    <div aria-label="Disponibilidad histórica" className="availability-chart">
      <svg viewBox="0 0 100 100" role="img">
        <polyline
          points={points}
          fill="none"
          stroke="#3bd671"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <small>Disponibilidad por período</small>
    </div>
  );
}

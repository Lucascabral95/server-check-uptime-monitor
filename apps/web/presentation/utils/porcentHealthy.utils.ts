export const porcentHealthy = (totalMonitors: number, countUp: number): number => {
  if (totalMonitors === 0) return 0;

  return Number(((countUp / totalMonitors) * 100).toFixed(2));
};

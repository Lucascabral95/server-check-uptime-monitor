import { useMemo } from 'react';

interface UseUptimeCheckProps {
  lastCheck: string | Date | null;
  frequency: number;
}

export const useUptimeCheck = ({ lastCheck, frequency }: UseUptimeCheckProps) => {
  const timeUntilNextCheck = useMemo(() => {
    if (!lastCheck) return 0;

    const now = new Date().getTime();
    const lastCheckTime = typeof lastCheck === 'string' 
      ? new Date(lastCheck).getTime()
      : lastCheck.getTime();
    
    const nextCheckTime = lastCheckTime + (frequency * 1000);
    const diffMs = nextCheckTime - now;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    return Math.max(0, diffSeconds);
  }, [lastCheck, frequency]);

  return { timeUntilNextCheck };
};
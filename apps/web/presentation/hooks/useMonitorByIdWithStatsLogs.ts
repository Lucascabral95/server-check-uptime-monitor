import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import useUptime from "./useUptime.hook";
import { GetPingLoginterface } from "@/infraestructure/interfaces";

const ENDPOINT_HOME = "/dashboard/home"
const LIMIT_INCIDENTS = 20

const useMonitorByIdWithStatsLogs = () => {
    const { id } = useParams<{ id: string }>()
    const { statsLogsByUptimeId } = useUptime(id!);
    const router = useRouter()

    const [countLimitIncidents, setCountLimitIncidents] = useState<number>(LIMIT_INCIDENTS)

    const redirectToLink = () => {
      window.open(`${statsLogsByUptimeId.data?.monitor?.url}`, "_blank")
    }

    const handleDetailsMonitor = () => {
      router.push(ENDPOINT_HOME)   
    }

    const stats24h = useMemo(() => {
    const healthPercentage = statsLogsByUptimeId.data?.stats?.last24Hours?.healthPercentage ?? 100;

    const upBarsCount = Math.round((healthPercentage / 100) * 24);

    const isLowHealth = healthPercentage < 50;

    return Array.from({ length: 24 }, (_, i) => {
      if (isLowHealth) {
        return false; 
      }
      return i < upBarsCount;
    });
  }, [statsLogsByUptimeId.data?.stats?.last24Hours?.healthPercentage]);

  // Mostrar los logs solo que tuvieron incidentes
  const errorLogs = useMemo<GetPingLoginterface[]>(() => {
  const logs = statsLogsByUptimeId.data?.monitor?.logs ?? [];

  return logs.filter(log =>
    !log.success ||
    log.statusCode >= 400 ||
    Boolean(log.error)
  );
}, [statsLogsByUptimeId.data?.monitor?.logs]);

    const handleMoreIncidents = () => {
      setCountLimitIncidents(countLimitIncidents + LIMIT_INCIDENTS)
    }

    return {
     data: statsLogsByUptimeId.data,
     isLoading: statsLogsByUptimeId.isLoading,
     isError: statsLogsByUptimeId.isError,
     refetch: statsLogsByUptimeId.refetch,
     errorLogs,

     redirectToLink,
     handleDetailsMonitor,
     stats24h,

     handleMoreIncidents,
     countLimitIncidents,
    }
}

export default useMonitorByIdWithStatsLogs;
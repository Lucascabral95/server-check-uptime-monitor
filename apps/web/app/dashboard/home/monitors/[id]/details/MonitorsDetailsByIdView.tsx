"use client";

import { IoIosArrowBack } from "react-icons/io";

import LoadingState from "@/presentation/components/shared/states/LoadingState";
import ErrorState from "@/presentation/components/shared/states/ErrorState";
import MonitorDetailsHeader from "@/presentation/components/Dashboard/Home/DetailsUptime/MonitorDetailsHeader";
import MonitorStatsOverview from "@/presentation/components/Dashboard/Home/DetailsUptime/MonitorStatsOverview";
import LatestIncidents from "@/presentation/components/Dashboard/Home/DetailsUptime/LatestIncidents";
import useMonitorByIdWithStatsLogs from "@/presentation/hooks/useMonitorByIdWithStatsLogs";
import { useQuery } from "@tanstack/react-query";
import { getMonitorAggregates } from "@/lib/Resources/Api/UptimeApi";
import { MonitorAvailabilityChart } from "@/presentation/components/MonitorAvailabilityChart";
import { MonitorAggregateDto } from "@/infraestructure/interfaces";

import "./MonitorsDetails.scss";

const MonitorsDetailsByIdView = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    redirectToLink,
    handleDetailsMonitor,
    stats24h,
    errorLogs,
    handleMoreIncidents,
    countLimitIncidents,
  } = useMonitorByIdWithStatsLogs();
  const monitorId = data?.monitor?.id;
  const aggregates = useQuery<MonitorAggregateDto[]>({
    queryKey: ["monitor-aggregates", monitorId],
    queryFn: () => getMonitorAggregates(monitorId!),
    enabled: Boolean(monitorId),
  });

  if (isLoading) {
    return <LoadingState message="Cargando monitoreo..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar el monitoreo"
        description="No pudimos obtener los datos del monitoreo. Intentá nuevamente."
        onRetry={() => {
          refetch();
        }}
      />
    );
  }

  if (!data) {
    return (
      <ErrorState
        title="Monitoreo no encontrado"
        description="No pudimos obtener los datos del monitoreo. Intentá nuevamente."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="details-monitor">
      <div className="details-monitor-container">
        <div className="button-back-back">
          <button className="b-back" onClick={() => handleDetailsMonitor()}>
            <IoIosArrowBack className="icon" />
            Monitoreos
          </button>
        </div>

        <MonitorDetailsHeader monitor={data} handleOpenUrl={redirectToLink} />

        <MonitorStatsOverview monitor={data} stats24h={stats24h} />
        <MonitorAvailabilityChart data={aggregates.data ?? []} />

        <LatestIncidents
          errorLogs={errorLogs}
          handleMoreIncidents={handleMoreIncidents}
          countLimitIncidents={countLimitIncidents}
        />
      </div>
    </div>
  );
};

export default MonitorsDetailsByIdView;

'use client'

import StatusUptimes from "@/presentation/components/Dashboard/Home/StatusUptimes/StatusUptimes";
import ErrorState from "@/presentation/components/shared/states/ErrorState";
import LoadingState from "@/presentation/components/shared/states/LoadingState";
import useUptime from "@/presentation/hooks/useUptime.hook";

import "./ServerStatusDashboard.scss"

const ServerStatusDashboardView  = () => { 
    const params = {
        includeInactive: true,
        // El backend cachea el límite en 100 (ver PaginationUptimeDto,
        // @Max(100)) para evitar queries sin límite.
        limit: 100,
    };

  const { uptimes, myStats } = useUptime(undefined, params);

  const isInitialLoading = (uptimes.isLoading && !uptimes.data) || (myStats.isLoading && !myStats.data);

  if (isInitialLoading) {
    return <LoadingState message="Cargando monitoreos..." />;
  }

  if (uptimes.isError || myStats.isError) {
    return (
      <ErrorState
        title="Error al cargar el dashboard"
        description="No pudimos obtener los datos de tus monitoreos. Intentá nuevamente."
        onRetry={() => {
          uptimes.refetch();
          myStats.refetch();
        }}
      />
    );
  }

  return (
    <div className="dashboard-servers">
      <div className="title-button">
        <div className="title-home">
       <h2>Estado de servidores</h2>
        </div>
      </div>

      <StatusUptimes data={uptimes.data!} />

    </div>
  )
}

export default ServerStatusDashboardView;
"use client"

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Status, SortBy } from "@/infraestructure/interfaces";
import { useRouter } from "next/navigation";

import { FiltersMonitor } from "@/presentation/components/Filters";
import useUptime from "@/presentation/hooks/useUptime.hook";
import CardUptime from "@/presentation/components/Dashboard/Home/CardUptime";
import ChartStats from "@/presentation/components/Dashboard/Home/ChartStats";
import ChartStatsLastDay from "@/presentation/components/Dashboard/Home/ChartStatsLastDay";
import ErrorState from "@/presentation/components/shared/states/ErrorState";
import LoadingState from "@/presentation/components/shared/states/LoadingState";

import "./dashboard-home.scss"

const ENDPOINT_ADD_MONITOR = "/dashboard/home/monitors/new/http";

const DashboardHome = () => {
  const router = useRouter();

  const [filters, setFilters] = useState<{
    search?: string;
    status?: Status | null;
    sortBy?: SortBy | null;
  }>({});

  const { uptimes, myStats } = useUptime(undefined, filters);

  const handleFiltersChange = (newFilters: {
    search?: string;
    status?: Status | null;
    sortBy?: SortBy | null;
  }) => {
    setFilters(newFilters);
  };

  function redirectToAddServer() {
    router.push(ENDPOINT_ADD_MONITOR);
  }

   // States: Loading / Error
     if (uptimes.isLoading || myStats.isLoading) {
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
    <div className="dashboard-home">
      <div className="title-button">
      <div className="title-home">
       <h2> Monitoreo de servidores </h2>
      </div>
      <div className="button-add-server">
         <button className="add-server" onClick={redirectToAddServer}>
          <FiPlus className="icon" />
            <span>Nuevo servidor</span>
         </button>
      </div>
      </div>
      <div className="filter-current">
        <FiltersMonitor onFiltersChange={handleFiltersChange} monitorCount={uptimes.data?.pagination?.totalItems} />
      </div>

     <div className="cont-charts-home">
      <div className="c">
      <ChartStats 
         statsUser={myStats.data!}
         />
      </div>
      <div className="c">
      <ChartStatsLastDay
         statsUser={myStats.data!}
         />
      </div>
         </div>

     <div className="all-uptimes">
      <div className="cards-grid">
        {uptimes.data?.data?.map((uptime, index: number) => (
          <CardUptime key={index} uptimes={uptime} />
        ))}
      </div>
     </div>

    </div>
  )
}

export default DashboardHome

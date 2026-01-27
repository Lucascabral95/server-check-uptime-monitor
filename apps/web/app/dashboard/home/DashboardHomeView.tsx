"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";

import { FiltersMonitor } from "@/presentation/components/Filters";
import useUptime from "@/presentation/hooks/useUptime.hook";
import CardUptime from "@/presentation/components/Dashboard/Home/CardUptime";
import ChartStats from "@/presentation/components/Dashboard/Home/ChartStats";
import ChartStatsLastDay from "@/presentation/components/Dashboard/Home/ChartStatsLastDay";
import ErrorState from "@/presentation/components/shared/states/ErrorState";
import LoadingState from "@/presentation/components/shared/states/LoadingState";
import Toast from "@/presentation/components/shared/Toasts/Toast";
import { useFilters } from "@/presentation/hooks";
import { ToastProps } from "@/infraestructure/interfaces";

import "./dashboard-home.scss";

const ENDPOINT_ADD_MONITOR = "/dashboard/home/monitors/new/http";

const DashboardHome = () => {
  const router = useRouter();

  const [toast, setToast] = useState<ToastProps>({
    visible: false,
    message: "",
    type: "success",
  });

  const {
    searchValue,
    selectedStatus,
    selectedSort,
    filters,
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
    clearSearch,
  } = useFilters();

  const { uptimes, myStats } = useUptime(undefined, filters);

  const redirectToAddServer = () => {
    router.push(ENDPOINT_ADD_MONITOR);
  };

  const isInitialLoading =
    (uptimes.isLoading && !uptimes.data) ||
    (myStats.isLoading && !myStats.data);

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
    <div className="dashboard-home">
      <div className="title-button">
        <div className="title-home">
          <h2>Monitoreo de servidores</h2>
        </div>

        <div className="button-add-server">
          <button className="add-server" onClick={redirectToAddServer}>
            <FiPlus className="icon" />
            <span>Nuevo servidor</span>
          </button>
        </div>
      </div>

      <div className="filter-current">
        <FiltersMonitor
          searchValue={searchValue}
          selectedStatus={selectedStatus}
          selectedSort={selectedSort}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onSortChange={handleSortChange}
          onClearSearch={clearSearch}
          monitorCount={uptimes.data?.pagination?.totalItems}
        />
      </div>

      <div className="cont-charts-home">
        <div className="c">
          <ChartStats statsUser={myStats.data!} />
        </div>
        <div className="c">
          <ChartStatsLastDay statsUser={myStats.data!} />
        </div>
      </div>

      <div className="all-uptimes">
        {uptimes.isFetching && (
          <div className="loading-overlay">Buscando...</div>
        )}

        <div className="cards-grid">
          {uptimes.data?.data?.map((uptime) => (
            <CardUptime
              key={uptime.id}
              uptimes={uptime}
              setToast={setToast}
            />
          ))}
        </div>
      </div>

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
        />
      )}
    </div>
  );
};

export default DashboardHome;

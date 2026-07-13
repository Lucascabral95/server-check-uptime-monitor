'use client';

import IncidentsTable from "@/presentation/components/Dashboard/Home/Incidents/TableIncidents";
import useFilteredIncidents from "@/presentation/hooks/useFilteredIncidents.hook";
import LoadingState from "@/presentation/components/shared/states/LoadingState";
import ErrorState from "@/presentation/components/shared/states/ErrorState";
import FiltersIncidents from "@/presentation/components/Filters/FiltersMonitor/FiltersIncidents";

import "./Incidents.scss"

const IncidentsDashboardView = () => {
    const {
      data,
      isLoading,
      isError,
      refetch,
      searchIncident,
      selectedSort,
      handleSearchChange,
      handleSortChange,
      onClearSearch,
      } = useFilteredIncidents();

  if (isLoading) {
    return <LoadingState message="Cargando incidentes..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al obtener los incidentes"
        description="No pudimos obtener los incidentes. Intentá nuevamente."
        onRetry={() => {
          refetch();
        }}
      />
    );
  }

  const resolvedCount = Math.max(
    (data?.totalIncidents ?? 0) - (data?.ongoingIncidents ?? 0),
    0
  );

  return (
    <div className="incidents-dashboard">
      <div className="title-incidents">
        <h1>Incidentes</h1>
      </div>

      <div className="incidents-stats">
        <div className="stat-card">
          <span className="label">Total</span>
          <span className="value">{data?.totalIncidents ?? 0}</span>
        </div>
        <div className="stat-card">
          <span className="label">Resueltos</span>
          <span className="value up">{resolvedCount}</span>
        </div>
        <div className="stat-card">
          <span className="label">En curso</span>
          <span className="value down">{data?.ongoingIncidents ?? 0}</span>
        </div>
      </div>

      <div className="filter-current">
        <FiltersIncidents
          searchValue={searchIncident}
          selectedSort={selectedSort}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onClearSearch={onClearSearch}
          incidentCount={data?.totalIncidents}
        />
      </div>

      <IncidentsTable data={data!} />

    </div>
  )
}

export default IncidentsDashboardView;
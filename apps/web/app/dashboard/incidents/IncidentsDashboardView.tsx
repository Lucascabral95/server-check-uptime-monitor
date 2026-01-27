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

  return (
    <div className="incidents-dashboard">
      <div className="title-incidents">
        <h1>Incidentes</h1>
      </div>

      <div className="filter-current">
        <FiltersIncidents
          searchValue={searchIncident}
          selectedSort={selectedSort}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onClearSearch={onClearSearch}
          incidentCount={data?.incidents?.length}
        />
      </div>

      <IncidentsTable data={data!} />

    </div>
  )
}

export default IncidentsDashboardView;
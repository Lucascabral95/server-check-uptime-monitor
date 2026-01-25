import { useMemo } from "react";

import useUptime from "./useUptime.hook";
import useFilterIncidents from "./filtersUptime/useFilterIncidents.hook";
import { PaginationParams } from "@/infraestructure/interfaces";

const useFilteredIncidents = () => {
    const {
        filters,
        searchIncident,
        selectedSort,
        clearSearch,
        clearAllFilters,
        handleSearchChange,
        handleSortChange,
    } = useFilterIncidents();

    const params: PaginationParams = useMemo(() => ({
        search: filters.search,
        sortBy: filters.sortBy,
    }), [filters.search, filters.sortBy]);

    const {
        incidentsByUser,
    } = useUptime(undefined, params);

    return {
        data: incidentsByUser.data,
        isLoading: incidentsByUser.isLoading,
        isError: incidentsByUser.isError,
        refetch: incidentsByUser.refetch,
        
        filters,
        searchIncident,
        selectedSort,
        onClearSearch: clearSearch,
        clearAllFilters,
        handleSearchChange,
        handleSortChange,
    };
};

export default useFilteredIncidents;

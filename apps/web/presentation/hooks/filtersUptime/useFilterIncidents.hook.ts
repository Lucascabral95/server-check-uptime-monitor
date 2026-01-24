import { 
  useCallback,
   useEffect,
    useMemo,
     useRef,
      useState,
     } from "react";

import { SortBy } from "@/infraestructure/interfaces";

const useFilterIncidents = () => {
    const [searchIncident, setSearchIncident] = useState<string>("");
    const [selectedSort, setSelectedSort] = useState<SortBy | null>(null);

    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
    const timeRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
      
      timeRef.current = setTimeout(() => {
        setDebouncedSearch(searchIncident);
      }, 500);

      return () => {
        if (timeRef.current) {
          clearTimeout(timeRef.current);
        }
      };
    }, [searchIncident])

    const filters = useMemo(() => ({
        search: debouncedSearch || undefined,
        sortBy: selectedSort || undefined,
    }), [debouncedSearch, selectedSort])

    const handleSearchChange = useCallback((value: string) => {
        setSearchIncident(value);
    }, [])

    const handleSortChange = useCallback((sortBy: SortBy | null) => {
        setSelectedSort(sortBy);
    }, [])

    const clearSearch = useCallback(() => {
        setSearchIncident("");
        setDebouncedSearch("");
    }, [])

    const clearAllFilters = useCallback(() => {
        setSearchIncident("");
        setDebouncedSearch("");
        setSelectedSort(null);
    }, [])
 
    return {
        filters,
        searchIncident,
        selectedSort,
        setSearchIncident,
        setSelectedSort,
        clearSearch,
        clearAllFilters,
        handleSearchChange,
        handleSortChange,
    }
}

export default useFilterIncidents;
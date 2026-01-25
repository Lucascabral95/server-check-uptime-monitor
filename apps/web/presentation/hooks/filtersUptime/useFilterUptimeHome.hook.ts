import { 
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
 } from "react";
import { Status, SortBy } from "@/infraestructure/interfaces";

export const useFilters = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<Status | "ALL" | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortBy | null>(null);
  
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchValue]);

  const filters = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: (selectedStatus && selectedStatus !== "ALL") ? selectedStatus : undefined,
    sortBy: selectedSort || undefined,
  }), [debouncedSearch, selectedStatus, selectedSort]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleStatusChange = useCallback((status: Status | null) => {
    setSelectedStatus(status);
  }, []);

  const handleSortChange = useCallback((sortBy: SortBy | null) => {
    setSelectedSort(sortBy);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue("");
    setDebouncedSearch("");
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    setDebouncedSearch("");
    setSelectedStatus(null);
    setSelectedSort(null);
  }, []);

  return {
    searchValue,
    selectedStatus,
    selectedSort,
    filters,
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
    clearSearch,
    clearAllFilters,
  };
};
"use client";

import { useState, useRef, useEffect, memo } from "react";
import { CiFilter } from "react-icons/ci";
import { MdOutlineSwapVert } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Status, SortBy } from "@/infraestructure/interfaces";

import FilterMonitorInside from "./FilterMonitorInside";
import SortMonitorInside from "./SortMonitorInside";
import "./FiltersMonitor.scss";

interface FiltersMonitorProps {
  searchValue: string;
  selectedStatus: Status | "ALL" | null;
  selectedSort: SortBy | null;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: Status | null) => void;
  onSortChange: (sortBy: SortBy | null) => void;
  onClearSearch: () => void;
  monitorCount?: number;
}

const FiltersMonitor = memo(({
  searchValue,
  selectedStatus,
  selectedSort,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onClearSearch,
  monitorCount
}: FiltersMonitorProps) => {
  const [openFilter, setOpenFilter] = useState(false);
  const [openFilterSort, setOpenFilterSort] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(false);
        setOpenFilterSort(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleSearchClear = () => {
    onClearSearch();
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const hasActiveFilters = searchValue || (selectedStatus && selectedStatus !== "ALL") || selectedSort;
  const activeFiltersCount = [selectedStatus && selectedStatus !== "ALL", selectedSort, searchValue].filter(Boolean).length;

  return (
    <div ref={containerRef} className="filter-container">
      <div className="filter">
        <div className="count-monitor">
          <span>{monitorCount !== undefined ? `${monitorCount} Monitore${monitorCount === 1 ? 'o' : 's'}` : 'Monitores'}</span>
        </div>
      </div>

      <div className="search-filter-order">
        <div className="search">
          <div className="search-input-wrapper">
            <input
              ref={searchInputRef}
              className="input-search"
              type="text"
              placeholder="Buscar por nombre o URL..."
              value={searchValue}
              onChange={handleSearchInputChange}
            />
            {searchValue && (
              <button
                className="search-clear-button"
                onClick={handleSearchClear}
                aria-label="Limpiar búsqueda"
                type="button"
              >
                <IoClose className="clear-icon" />
              </button>
            )}
          </div>
        </div>

        <div className="cont-filter-of-monitors">
          <div
            className={`filter-of-monitors ${hasActiveFilters ? "has-filters" : ""}`}
            onClick={() => setOpenFilter(prev => !prev)}
          >
            <CiFilter
              className="icon-filter"
              style={{ color: openFilter ? "#3BD671" : "#ffffff" }}
            />
            <span
              style={{ color: openFilter ? "#3BD671" : "#ffffff" }}
              className="text-filter"
            >
              Filtrar
            </span>
            {activeFiltersCount > 0 && (
              <span className="filter-badge">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {openFilter && (
            <FilterMonitorInside
              onClose={() => setOpenFilter(false)}
              onApply={onStatusChange}
              initialStatus={selectedStatus}
            />
          )}
        </div>

        <div className="cont-sort-by-status">
          <div
            className={`sort-by-status ${selectedSort ? "has-sort" : ""}`}
            onClick={() => setOpenFilterSort(prev => !prev)}
          >
            <MdOutlineSwapVert
              className="icon-filter"
              style={{ color: openFilterSort ? "#3BD671" : "#ffffff" }}
            />
            <span
              style={{ color: openFilterSort ? "#3BD671" : "#ffffff" }}
              className="text-filter"
            >
              Ordenar
            </span>
            {selectedSort && <span className="sort-indicator">•</span>}
          </div>
          {openFilterSort && (
            <SortMonitorInside
              onClose={() => setOpenFilterSort(false)}
              onApply={onSortChange}
              initialSort={selectedSort}
            />
          )}
        </div>
      </div>
      
    </div>
  );
});

FiltersMonitor.displayName = "FiltersMonitor";

export default FiltersMonitor;
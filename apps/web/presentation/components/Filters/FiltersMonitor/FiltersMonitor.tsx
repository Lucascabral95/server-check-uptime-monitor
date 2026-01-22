"use client";

import { useState, useRef, useEffect } from "react";
import { CiFilter } from "react-icons/ci";
import { MdOutlineSwapVert } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Status } from "@prisma/client";
import { SortBy } from "@/infraestructure/interfaces";

import "./FiltersMonitor.scss";
import FilterMonitorInside from "./FilterMonitorInside";
import SortMonitorInside from "./SortMonitorInside";

interface FiltersMonitorProps {
  onFiltersChange: (filters: {
    search?: string;
    status?: Status | null;
    sortBy?: SortBy | null;
  }) => void;
  monitorCount?: number;
}

const FiltersMonitor = ({ onFiltersChange, monitorCount }: FiltersMonitorProps) => {
  const [openFilter, setOpenFilter] = useState(false);
  const [openFilterSort, setOpenFilterSort] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Status | "ALL" | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortBy | null>(null);
  const [displayStatus, setDisplayStatus] = useState<Status | "ALL" | null>(null);

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        search: searchValue || undefined,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        sortBy: selectedSort,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, selectedStatus, selectedSort, onFiltersChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchValue("");
    searchInputRef.current?.focus();
  };

  const handleStatusApply = (status: Status | null) => {
    setSelectedStatus(status);
    setDisplayStatus(status === null ? "ALL" : status);
  };

  const handleSortApply = (sortBy: SortBy | null) => {
    setSelectedSort(sortBy);
  };

  const hasActiveFilters = searchValue || selectedStatus || selectedSort;

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
              onChange={handleSearchChange}
            />
            {searchValue && (
              <button
                className="search-clear-button"
                onClick={handleSearchClear}
                aria-label="Limpiar búsqueda"
              >
                <IoClose className="clear-icon" />
              </button>
            )}
          </div>
        </div>

        <div className="cont-filter-of-monitors">
          <div
            className={`filter-of-monitors ${hasActiveFilters ? "has-filters" : ""}`}
            onClick={() => setOpenFilter((prev) => !prev)}
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
            {(displayStatus || selectedSort || searchValue) && (
              <span className="filter-badge">
                {[displayStatus, selectedSort, searchValue].filter(Boolean).length}
              </span>
            )}
          </div>
          {openFilter && (
            <FilterMonitorInside
              onClose={() => setOpenFilter(false)}
              onApply={handleStatusApply}
              initialStatus={displayStatus}
            />
          )}
        </div>

        <div className="cont-sort-by-status">
          <div
            className={`sort-by-status ${selectedSort ? "has-sort" : ""}`}
            onClick={() => setOpenFilterSort((prev) => !prev)}
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
              onApply={handleSortApply}
              initialSort={selectedSort}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltersMonitor;

"use client";

import { 
    useState,
     useRef,
      useEffect,
       memo,
     } from "react";
import { MdOutlineSwapVert } from "react-icons/md";
import { IoClose } from "react-icons/io5";

import { SortBy } from "@/infraestructure/interfaces";
import SortIncidentsInside from "./SortIncidentsInside";

import "./FiltersMonitor.scss";

interface FiltersIncidentsProps {
    searchValue: string;
    selectedSort: SortBy | null;
    onSearchChange: (value: string) => void;
    onSortChange: (sortBy: SortBy | null) => void;
    onClearSearch: () => void;
    incidentCount?: number;
}

const FiltersIncidents = memo(({
    searchValue,
    selectedSort,
    onSearchChange,
    onSortChange,
    onClearSearch,
    incidentCount
}: FiltersIncidentsProps) => {
    const [openSortDropdown, setOpenSortDropdown] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpenSortDropdown(false);
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

    const hasActiveFilters = searchValue || selectedSort;
    const activeFiltersCount = [selectedSort, searchValue].filter(Boolean).length;

    return (
        <div ref={containerRef} className="filter-container">
            <div className="filter">
                <div className="count-monitor">
                    <span>{incidentCount !== undefined ? `${incidentCount} Incidente${incidentCount === 1 ? '' : 's'}` : 'Incidentes'}</span>
                </div>
            </div>

            <div className="search-filter-order">
                <div className="search">
                    <div className="search-input-wrapper">
                        <input
                            ref={searchInputRef}
                            className="input-search"
                            type="text"
                            placeholder="Buscar por nombre o URL del monitor..."
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

                <div className="cont-sort-by-status">
                    <div
                        className={`sort-by-status ${selectedSort ? "has-sort" : ""}`}
                        onClick={() => setOpenSortDropdown(prev => !prev)}
                    >
                        <MdOutlineSwapVert
                            className="icon-filter"
                            style={{ color: openSortDropdown ? "#3BD671" : "#ffffff" }}
                        />
                        <span
                            style={{ color: openSortDropdown ? "#3BD671" : "#ffffff" }}
                            className="text-filter"
                        >
                            Ordenar
                        </span>
                        {hasActiveFilters && activeFiltersCount > 0 && (
                            <span className="filter-badge">
                                {activeFiltersCount}
                            </span>
                        )}
                        {selectedSort && <span className="sort-indicator">•</span>}
                    </div>
                    {openSortDropdown && (
                        <SortIncidentsInside
                            onClose={() => setOpenSortDropdown(false)}
                            onApply={onSortChange}
                            initialSort={selectedSort}
                        />
                    )}
                </div>
            </div>

        </div>
    );
});

FiltersIncidents.displayName = "FiltersIncidents";

export default FiltersIncidents;

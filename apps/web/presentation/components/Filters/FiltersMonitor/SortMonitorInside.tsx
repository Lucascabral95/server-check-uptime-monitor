import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { SortBy } from "@/infraestructure/interfaces";
import "./FiltersMonitor.scss";

interface SortOption {
  value: SortBy;
  label: string;
  group: string;
}

interface SortMonitorInsideProps {
  onClose: () => void;
  onApply: (sortBy: SortBy | null) => void;
  initialSort?: SortBy | null;
}

const sortGroups = {
  ALPHABETICAL: "Orden alfabético",
  DATE: "Orden por fecha",
  STATUS: "Orden por estado",
};

const sortOptions: SortOption[] = [
  // Orden alfabético
  { value: SortBy.NAME_ASC, label: "A => Z", group: sortGroups.ALPHABETICAL },
  { value: SortBy.NAME_DESC, label: "Z => A", group: sortGroups.ALPHABETICAL },
  // Orden por fecha
  { value: SortBy.RECENT, label: "Más recientes primero", group: sortGroups.DATE },
  { value: SortBy.OLDEST, label: "Más antiguos primero", group: sortGroups.DATE },
  // Orden por estado
  { value: SortBy.STATUS_UP, label: "Operativos primero", group: sortGroups.STATUS },
  { value: SortBy.STATUS_DOWN, label: "Fallidos primero", group: sortGroups.STATUS },
];

const SortMonitorInside = ({
  onClose,
  onApply,
  initialSort = null,
}: SortMonitorInsideProps) => {
  const [selectedSort, setSelectedSort] = useState<SortBy | null>(initialSort);

  const handleSortClick = (sortValue: SortBy) => {
    setSelectedSort(sortValue);
  };

  const handleCancel = () => {
    setSelectedSort(null);
    onClose();
  };

  const handleApply = () => {
    onApply(selectedSort);
    onClose();
  };

  const groupedOptions = sortOptions.reduce((acc, option) => {
    if (!acc[option.group]) {
      acc[option.group] = [];
    }
    acc[option.group].push(option);
    return acc;
  }, {} as Record<string, SortOption[]>);

  return (
    <div className="sort-monitor-inside">
      <div className="container">
        <div className="title-close">
          <div className="text-filter">
            <span>Ordenar</span>
          </div>
          <div className="button" onClick={onClose}>
            <IoMdClose className="icon" />
          </div>
        </div>

        <div className="sort-options">
          {Object.entries(groupedOptions).map(([group, options]) => (
            <div key={group} className="sort-group">
              <div className="sort-group-title">
                <span>{group}</span>
              </div>
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`sort-option ${selectedSort === option.value ? "active" : ""}`}
                  onClick={() => handleSortClick(option.value)}
                >
                  <span>{option.label}</span>
                  {selectedSort === option.value && (
                    <span className="check-indicator">✓</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button className="btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button className="btn-apply" onClick={handleApply}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortMonitorInside;

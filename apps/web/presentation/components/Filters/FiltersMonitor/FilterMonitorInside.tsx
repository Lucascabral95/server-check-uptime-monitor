import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { Status } from "@prisma/client";
import "./FiltersMonitor.scss";

type StatusType = Status | "ALL" | null;

interface FilterMonitorInsideProps {
  onClose: () => void;
  onApply: (status: Status | null) => void;
  initialStatus?: StatusType;
}

const FilterMonitorInside = ({
  onClose,
  onApply,
  initialStatus = null,
}: FilterMonitorInsideProps) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusType>(initialStatus);

  const statusOptions = [
    { value: "ALL" as StatusType, label: "Todos", icon: null },
    { value: Status.UP as StatusType, label: "Operativos", icon: "up" },
    { value: Status.DOWN as StatusType, label: "Fallidos", icon: "down" },
  ];

  const handleStatusClick = (status: StatusType) => {
    setSelectedStatus(status);
  };

  const handleCancel = () => {
    setSelectedStatus(null);
    onClose();
  };

  const handleApply = () => {
    onApply(selectedStatus === "ALL" ? null : selectedStatus);
    onClose();
  };

  return (
    <div className="filter-monitor-inside">
      <div className="container">
        <div className="title-close">
          <div className="text-filter">
            <span>Filtrar</span>
          </div>
          <div className="button" onClick={onClose}>
            <IoMdClose className="icon" />
          </div>
        </div>

        <div className="status-options">
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className={`status-option ${selectedStatus === option.value ? "active" : ""}`}
              onClick={() => handleStatusClick(option.value)}
            >
              {option.icon && (
                <span className={`status-indicator ${option.icon}`}></span>
              )}
              {!option.icon && <span className="status-icon-all">•</span>}
              <span>{option.label}</span>
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

export default FilterMonitorInside;

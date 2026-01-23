"use client";

import { useState, useRef, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { IoIosMore, IoIosCreate, IoIosTrash } from "react-icons/io";
import { MdAccessTime, MdCheckCircle } from "react-icons/md";

import { formatDate, formatLastCheck, formatTimeRemaining, getStatusColor } from "@/presentation/utils";
import { GetUptimeDto } from '@/infraestructure/interfaces';
import { useUptimeCheck } from "@/presentation/hooks";
import { useRouter } from "next/navigation";
import useUptime from "@/presentation/hooks/useUptime.hook";
import "./CardUptime.scss";

interface CardUptimeProps {
  uptimes: GetUptimeDto;
}

const REDIRECT_FOR_EDIT = "/dashboard/home/monitors/"

const CardUptime = ({ uptimes }: CardUptimeProps) => {
  const { deleteUptime } = useUptime(); 

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const { timeUntilNextCheck } = useUptimeCheck({
    lastCheck: uptimes.lastCheck,
    frequency: uptimes.frequency
  });

  const handleEdit = () => {
    setIsMenuOpen(false);
    router.push(`${REDIRECT_FOR_EDIT}${uptimes.id}/edit`);
  };

  const handleDelete = (id: string) => {
    setIsMenuOpen(false);
    deleteUptime.mutate(id);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="card-uptime">
      <div className="card-uptime-container">
        <div className="status-icon-content-main">
          <div className="container-icon">
            <FaCircle className="icon" style={{ color: getStatusColor(uptimes.status) }} />
          </div>
          
          <div className="url-request-date">
            <div className="text-url">
              <p>{uptimes.name}</p>
            </div>
            <div className="request-date">
              <span className="text-protocol">HTTP</span>
              <span className="text-date">{formatDate(uptimes.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="more-data">
          <div className="check-info">
            <div className="next-check">
              <MdAccessTime className="icon" />
              <span>{formatTimeRemaining(timeUntilNextCheck)}</span>
            </div>
            <div className="last-check">
              <MdCheckCircle className="icon" />
              <span>{formatLastCheck(uptimes.lastCheck)}</span>
            </div>
          </div>

          <div className="reload-frequency">
            <IoReload className="icon" />
            <span>{uptimes.frequency}s</span>
          </div>
          
          <div className="more-menu-wrapper">
            <button
              ref={buttonRef}
              className="more-button"
              onClick={toggleMenu}
              aria-label="Más opciones"
              aria-expanded={isMenuOpen}
            >
              <IoIosMore className="icon-more" />
            </button>

            {isMenuOpen && (
              <div ref={menuRef} className="menu-dropdown open">
                <button className="menu-item" onClick={handleEdit}>
                  <IoIosCreate className="menu-icon" />
                  <span className="menu-text">Editar monitor</span>
                </button>
                <button className="menu-item danger" onClick={() => handleDelete(uptimes.id)}>
                  <IoIosTrash className="menu-icon" />
                  <span className="menu-text">Eliminar monitor</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardUptime;
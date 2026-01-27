"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { redirect, useRouter } from "next/navigation";
import { FaCircle } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { IoIosMore, IoIosCreate, IoIosTrash } from "react-icons/io";
import { MdAccessTime, MdCheckCircle } from "react-icons/md";

import {
  formatDate,
  formatLastCheck,
  formatTimeRemaining,
  getStatusColor,
} from "@/presentation/utils";
import { GetUptimeDto, ToastProps } from "@/infraestructure/interfaces";
import { useUptimeCheck } from "@/presentation/hooks";
import useUpdateMonitor from "@/presentation/hooks/useUpdateMonitor.hook";

import { TIMEOUT_TOAST } from "@/infraestructure/constants";
import "./CardUptime.scss";

interface CardUptimeProps {
  uptimes: GetUptimeDto;
  setToast: React.Dispatch<React.SetStateAction<ToastProps>>;
}

const REDIRECT_FOR_EDIT = "/dashboard/home/monitors/";
const REDIRECT_FOR_DETAILS = "/dashboard/home/monitors/";

const CardUptime = ({ uptimes, setToast }: CardUptimeProps) => {
  const router = useRouter();
  const { submitDelete } = useUpdateMonitor();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { timeUntilNextCheck } = useUptimeCheck({
    lastCheck: uptimes.lastCheck,
    frequency: uptimes.frequency,
  });

  const handleEdit = useCallback(() => {
    setIsMenuOpen(false);
    router.push(`${REDIRECT_FOR_EDIT}${uptimes.id}/edit`);
  }, [router, uptimes.id]);

  const handleDelete = useCallback(
    (id: string) => {
      setIsMenuOpen(false);

      submitDelete({
        id,
        onSuccess: () => {
          setToast({
            visible: true,
            message: "Monitor eliminado correctamente",
            type: "success",
          });

          setTimeout(
            () => setToast((prev) => ({ ...prev, visible: false })),
            TIMEOUT_TOAST
          );
        },
        onError: () => {
          setToast({
            visible: true,
            message: "Error al eliminar el monitor",
            type: "error",
          });

          setTimeout(
            () => setToast((prev) => ({ ...prev, visible: false })),
            TIMEOUT_TOAST
          );
        },
      });
    },
    [submitDelete, setToast]
  );

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
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
      <div
        className="card-uptime-container"
        onClick={() =>
          redirect(`${REDIRECT_FOR_DETAILS}${uptimes.id}/details`)
        }
      >
        <div className="status-icon-content-main">
          <div className="container-icon">
            <FaCircle
              className="icon"
              style={{ color: getStatusColor(uptimes.status) }}
            />
          </div>

          <div className="url-request-date">
            <div className="text-url">
              <p>{uptimes.name}</p>
            </div>
            <div className="request-date">
              <span className="text-protocol">HTTP</span>
              <span className="text-date">
                {formatDate(uptimes.createdAt)}
              </span>
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

          <div
            className="more-menu-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={buttonRef}
              className="more-button"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
            >
              <IoIosMore className="icon-more" />
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="menu-dropdown open"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <IoIosCreate className="menu-icon" />
                  <span className="menu-text">Editar monitor</span>
                </button>

                <button
                  className="menu-item danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(uptimes.id);
                  }}
                >
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

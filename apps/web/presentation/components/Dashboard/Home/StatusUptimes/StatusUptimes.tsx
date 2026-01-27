"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { TbActivity } from "react-icons/tb";
import { IoIosMore, IoIosCreate, IoIosTrash } from "react-icons/io";
import { useRouter } from "next/navigation";

import { GetAllUptimesDto, Status, GetUptimeDto, ToastProps } from '@/infraestructure/interfaces';
import useUpdateMonitor from "@/presentation/hooks/useUpdateMonitor.hook";
import Toast from "@/presentation/components/shared/Toasts/Toast";
import { TIMEOUT_TOAST } from "@/infraestructure/constants";

import './StatusUptimes.scss';

interface IncidentsListProps {
  data: GetAllUptimesDto;
}

const REDIRECT_FOR_EDIT = "/dashboard/home/monitors/"

const StatusUptimes = ({ data }: IncidentsListProps) => {
  const router = useRouter();
  const { submitDelete } = useUpdateMonitor();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [toast, setToast] = useState<ToastProps>({
    visible: false,
    message: "",
    type: "success",
  });

  const handleEdit = (server: GetUptimeDto) => {
    setOpenMenuId(null);
    router.push(`${REDIRECT_FOR_EDIT}${server.id}/edit`);
  };

  const handleDelete = useCallback((id: string) => {
    setOpenMenuId(null);

    submitDelete({
    onSuccess: () => {
      setToast({
        visible: true,
        message: 'Monitor eliminado correctamente',
        type: 'success',
      });

      setTimeout(
        () => setToast(prev => ({ ...prev, visible: false })),
        TIMEOUT_TOAST
      );
    },
    onError: () => {
      setToast({
        visible: true,
        message: 'Error al eliminar el monitor',
        type: 'error',
      });

      setTimeout(
        () => setToast(prev => ({ ...prev, visible: false })),
        TIMEOUT_TOAST
      );
    },
    id,
  });
}, [submitDelete]);

  const toggleMenu = (e: React.MouseEvent, serverId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(prev => prev === serverId ? null : serverId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuRef = menuRefs.current.get(openMenuId);
        const buttonRef = buttonRefs.current.get(openMenuId);

        if (
          menuRef &&
          !menuRef.contains(event.target as Node) &&
          buttonRef &&
          !buttonRef.contains(event.target as Node)
        ) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div className="incidents-list">
      <div className="list-header">
        <span>Nombre/URL</span>
        <span>Actividad actual</span>
        <span>Estado</span>
        <span className="actions">Acciones</span>
      </div>

      {data?.data.map((server, index) => (
        <Link href={`${REDIRECT_FOR_EDIT}${server.id}/details`} className="list-row" key={index}>
          <div className="name">
            <div className={`icon ${server.status === Status.UP ? 'UP' : 'DOWN'}`}>
              <span className="pulse" />
            </div>

            <div className="info">
              <strong>{server.name}</strong>
              <span className="sub">
                {server.url}
              </span>
            </div>
          </div>

          <div className="access" onClick={() => router.push(`${REDIRECT_FOR_EDIT}${server.id}/details`)}>

            <div className="span-activity">
              <div className="icon-activity">
                <TbActivity className="icon" />
              </div>
              <span className={server.isActive ? 'UP' : 'DOWN'}>
                {server.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div
            className={`status ${
              server.status === Status.UP ? 'UP' : 'DOWN'
            }`}
            onClick={() => router.push(`${REDIRECT_FOR_EDIT}${server.id}/details`)}
          >
            {server.status === Status.UP ? 'UP' : 'DOWN'}
          </div>

          <div className="row-actions">
            <div className="more-menu-wrapper">
              <button
                ref={(el) => {
                  if (el) buttonRefs.current.set(server.id, el);
                }}
                className="icon-btn"
                onClick={(e) => toggleMenu(e, server.id)}
                aria-label="Más opciones"
                aria-expanded={openMenuId === server.id}
              >
                <IoIosMore className="icon-more" />
              </button>

              {openMenuId === server.id && (
                <div
                  ref={(el) => {
                    if (el) menuRefs.current.set(server.id, el);
                  }}
                  className="menu-dropdown open"
                >
                  <button
                    className="menu-item"
                    onClick={() => handleEdit(server)}
                  >
                    <IoIosCreate className="menu-icon" />
                    <span className="menu-text">Editar monitor</span>
                  </button>
                  <button
                    className="menu-item danger"
                    onClick={() => handleDelete(server.id)}
                  >
                    <IoIosTrash className="menu-icon" />
                    <span className="menu-text">Eliminar monitor</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}

      {toast.visible && <Toast message={toast.message} type={toast.type} visible={toast.visible} /> }
      
    </div>
  );
};

export default StatusUptimes;

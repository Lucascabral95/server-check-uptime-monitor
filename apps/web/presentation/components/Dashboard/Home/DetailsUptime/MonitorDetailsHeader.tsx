'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { IoIosCreate, IoIosTrash } from 'react-icons/io';

import { GetStatsLogsByUptimeIdInterface, ToastInterface } from '@/infraestructure/interfaces';
import useUptime from '@/presentation/hooks/useUptime.hook';
import Toast from '@/presentation/components/shared/Toasts/Toast';
import './MonitorDetailsHeader.scss';
import { TIMEOUT_TOAST } from '@/infraestructure/constants';

interface MonitorDetailsHeaderProps {
    monitor: GetStatsLogsByUptimeIdInterface;
    handleOpenUrl: () => void;
}

const MonitorDetailsHeader = ({
    monitor,
    handleOpenUrl,
}: MonitorDetailsHeaderProps) => {
  const router = useRouter();
  const [toast, setToast] = useState<ToastInterface>({
    visible: false,
    message: '',
    type: 'success',
  });
  const { deleteUptime } = useUptime();

  const handleDeleteMonitor = () => {
    const id = monitor.monitor?.id;

    if (!id) return;

    deleteUptime.mutate(id, {
      onSuccess: () => {
  setToast({
    visible: true,
    message: 'Monitor eliminado correctamente',
    type: 'success',
  });

  setTimeout(() => {
    router.push('/dashboard/home');
  }, TIMEOUT_TOAST);
},
      onError: () => {
        setTimeout(() => {
          setToast({
            visible: true,
            message: 'Error eliminando el monitor',
            type: 'error',
          });
        }, TIMEOUT_TOAST);
      },
    });
  };

  return (
    <div className="monitor-details-header">
      <div className="left">
        <div className="status">
          <FaCircle
            className={`status-icon ${monitor.monitor?.isActive ? 'up' : 'down'}`}
          />
        </div>

        <div className="info">
          <div className="title-row">
            <h2>{monitor.monitor?.url}</h2>
            <FaExternalLinkAlt
              className="open-icon"
              onClick={handleOpenUrl}
            />
          </div>

          <div className="meta">
            <span className="type">HTTP/S</span>
            <span className="label">monitoreo para</span>
            <span className="url" onClick={handleOpenUrl}>
              {monitor.monitor?.url}
            </span>
          </div>
        </div>
      </div>

      <div className="actions">
        <Link
          href={`/dashboard/home/monitors/${monitor.monitor?.id}/edit`}
          className="btn edit"
        >
          <IoIosCreate className="icon" />
          Editar
        </Link>

        <button className="btn delete" onClick={() => handleDeleteMonitor()}>
          <IoIosTrash className="icon" />
          Eliminar
        </button>
      </div>

      <Toast {...toast} />
    </div>
  );
};

export default MonitorDetailsHeader;

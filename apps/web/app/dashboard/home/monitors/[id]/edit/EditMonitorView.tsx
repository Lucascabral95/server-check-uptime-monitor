'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoIosArrowBack } from "react-icons/io";

import {
  NotifyState,
  ToastInterface,
} from '@/infraestructure/interfaces';
import {
  IconChevron,
  IconHttp,
  IconLock,
  INTERVAL_OPTIONS,
  TIMEOUT_TOAST,
} from '@/infraestructure/constants';

import useUpdateMonitor from '@/presentation/hooks/useUpdateMonitor.hook';
import Toast from '@/presentation/components/shared/Toasts/Toast';
import './MonitorsEdit.scss';

const EditMonitorView = () => {
  const router = useRouter();
  
  const {
    url,
    name,
    setName,
    intervalIndex,
    setIntervalIndex,
    currentFrequency,
    notify,
    setNotify,
    isActive,
    setIsActive,
    uptimeById,
    updateUptime,
    submitUpdate,
  } = useUpdateMonitor();

  const [toast, setToast] = useState<ToastInterface>({
    visible: false,
    message: '',
    type: 'success',
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      submitUpdate({
        onSuccess: () => {
          setToast({
            visible: true,
            message: 'Monitor actualizado correctamente',
            type: 'success',
          });

          setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
          }, TIMEOUT_TOAST);
        },
        onError: () => {
          setToast({
            visible: true,
            message: 'Error al actualizar el monitor',
            type: 'error',
          });

          setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
          }, TIMEOUT_TOAST);
        },
      });
    },
    [submitUpdate]
  );

  if (uptimeById.isLoading) {
    return <p>Cargando monitor...</p>;
  }

  if (uptimeById.isError) {
    return <p>Error al cargar el monitor</p>;
  }

  const toggleNotify = (key: keyof NotifyState) => {
    setNotify(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDetailsMonitor = () => {
    router.push(`/dashboard/home/monitors/${uptimeById.data?.id}/details`);
  };

  return (
    <div className="monitor-setup-wrapper">
      <div className="button-back-back">
        <button className="b-back" onClick={() => handleDetailsMonitor()}>
          <IoIosArrowBack className='icon' />
          Detalles del monitor
        </button>
      </div>
    <div className="title-update-post">
      <h2> Editar {uptimeById.data?.name}</h2>
    </div>
      <form className="monitor-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="section-label">Tipo de monitoreo</label>
          <div className="big-select">
            <div className="big-select-content">
              <div className="icon-badge">
                <IconHttp />
              </div>
              <div className="text-content">
                <div className="title">Monitor HTTP / sitio web</div>
                <div className="subtitle">
                  Usá el monitor HTTP(S) para supervisar tu sitio web o API.
                </div>
              </div>
            </div>
            <IconChevron />
          </div>
        </div>

        <div className="divider" />

        <div className="form-section">
          <label className="section-label">URL del servidor</label>
          <input
            style={{ cursor: 'not-allowed' }}
            type="text"
            className="input-field"
            value={url}
            readOnly
          />
        </div>

        <div className="divider" />

        <div className="form-section">
          <div className="status-toggle-container">
            <div className="status-toggle-content">
              <label className="section-label mb-0">Estado del monitor</label>
              <p className="status-toggle-desc">
                {isActive ? 'El monitor está activo y realizará comprobaciones' : 'El monitor está pausado y no realizará comprobaciones'}
              </p>
            </div>
            <button
              type="button"
              className={`status-toggle-switch ${isActive ? 'active' : ''}`}
              onClick={() => setIsActive(!isActive)}
              aria-label={isActive ? 'Desactivar monitor' : 'Activar monitor'}
            >
              <span className="toggle-slider" />
            </button>
          </div>
        </div>

        <div className="grid-2-col">
          <div className="form-section">
            <div className="label-row">
              <label className="section-label">Grupo</label>
              <span className="premium-badge">
                <IconLock /> Disponible solo en <strong>Paid</strong>
              </span>
            </div>
            <div className="select-field disabled">
              <span>Monitoreos (default)</span>
              <IconChevron />
            </div>
          </div>

          <div className="form-section">
            <label className="section-label">Nombre</label>
            <input
              type="text"
              className="input-field"
              minLength={3}
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="divider" />

        <div className="form-section">
          <label className="section-label">Notificaciones</label>

          <div className="notify-grid">
            <div
              className={`notify-tile ${notify.email ? 'active' : ''}`}
              onClick={() => toggleNotify('email')}
            >
              <span>E-mail</span>
            </div>

            <div className="notify-tile disabled">SMS</div>
            <div className="notify-tile disabled">Voz</div>
            <div className="notify-tile disabled">Push</div>
          </div>
        </div>

        <div className="divider" />

        <div className="form-section">
          <label className="section-label">Intervalo</label>
          <p className="interval-desc">
            Cada <strong>{INTERVAL_OPTIONS[intervalIndex].label}</strong> (
            {currentFrequency}s)
          </p>

          <div
  className="slider-container"
  style={{ '--progress': `${(intervalIndex / (INTERVAL_OPTIONS.length - 1)) * 100}%` } as React.CSSProperties}
>
  <input
    type="range"
    min="0"
    max={INTERVAL_OPTIONS.length - 1}
    step="1"
    value={intervalIndex}
    onChange={e => setIntervalIndex(Number(e.target.value))}
    className="custom-range"
  />

  <div className="slider-ticks">
    {INTERVAL_OPTIONS.map((option, i) => (
      <span
        key={option.label}
        className={i === intervalIndex ? 'active-tick' : ''}
      >
        {option.label}
      </span>
    ))}
  </div>
</div>
        </div>

        <div className="button-add-server">
          <button type="submit" disabled={updateUptime.isPending}>
            Actualizar monitor
          </button>
        </div>
      </form>

      <Toast {...toast} />
    </div>
  );
};

export default EditMonitorView;
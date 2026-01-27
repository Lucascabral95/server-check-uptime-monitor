'use client';

import { useCallback, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';

import { CreateUptimeDto, NotifyState, ToastInterface } from '@/infraestructure/interfaces';
import { IconChevron, 
  IconHttp,
   IconLock,
    IconRefresh,
     INTERVAL_OPTIONS,
     TIMEOUT_TOAST,
     } from '@/infraestructure/constants';
import useNewMonitor from '@/presentation/hooks/useNewMonitor.hook';
import useUptime from '@/presentation/hooks/useUptime.hook';
import { createUptimeSchema } from '@/infraestructure/models';
import Toast from '@/presentation/components/shared/Toasts/Toast';
import './MonitorNewHttp.scss';
import { useRouter } from 'next/navigation';

const MonitorsNewHttp = () => {
  const router = useRouter();

  const { 
    url, 
    setUrl, 
    intervalIndex, 
    setIntervalIndex, 
    progressPercent,
    currentFrequency,
    notify,
    setNotify,
    name,
    setName,
    cleanup,
    } = useNewMonitor();

    const [toast, setToast] = useState<ToastInterface>({
      visible: false,
      message: "",
      type: "success",
    });

  const { createUptime } = useUptime();
 
   const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const body: CreateUptimeDto = {
      name: name,
      url: url,
      frequency: currentFrequency,
    };

    const result = createUptimeSchema.safeParse(body);

    if (!result.success) {
      console.error(result.error.format());
      return;
    }
    
    createUptime.mutate(result.data, {
      onSuccess: () => {
       console.log(`Felicidades, agregaste un monitor: ${JSON.stringify(result.data, null, 2)}`);

    setToast({
      visible: true,
      message: "Monitor agregado exitosamente",
      type: "success",
    });

    cleanup();

    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, TIMEOUT_TOAST);
  },
  onError: () => {
    setToast({
      visible: true,
      message: "Error al crear el monitor",
      type: "error",
    });

    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, TIMEOUT_TOAST);
  },
});

  },
  [url, currentFrequency, createUptime, name, cleanup]
);

  const toggleNotify = (key: keyof NotifyState) => {
    setNotify(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBackToMonitors = () => {
    router.push('/dashboard/home');
  };

  return (
    <div className="monitor-setup-wrapper">

<div className="button-back-back">
        <button className="b-back" onClick={handleBackToMonitors}>
          <IoIosArrowBack className='icon' />
          Monitores
        </button>
      </div>
    <div className="title-update-post">
      <h2> Agregar nuevo monitor</h2>
    </div>

      <form className="monitor-card" onSubmit={handleSubmit}>
        
        <div className="form-section">
          <label className="section-label">Tipo de monitoreo </label>
          <div className="big-select">
            <div className="big-select-content">
              <div className="icon-badge">
                <IconHttp />
              </div>
              <div className="text-content">
                <div className="title">Monitor HTTP / sitio web</div>
                <div className="subtitle">Usá el monitor HTTP(S) para supervisar tu sitio web, endpoint de API, o cualquier servicio que funcione sobre HTTP.</div>
              </div>
            </div>
            <IconChevron />
          </div>
        </div>

        <div className="divider"></div>

        <div className="form-section">
          <label className="section-label">URL del servidor</label>
          <input 
            required
            placeholder="https://google.com"
            type="text" 
            className="input-field" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="grid-2-col">
          <div className="form-section">
            <div className="label-row">
              <label className="section-label">Grupo</label>
              <span className="premium-badge">
                <IconLock /> Grupos disponibles solo en <strong>Paid</strong> plans. <a href="#">Upgrade now</a>
              </span>
            </div>
            <div className="select-field disabled">
              <span>Monitoreos (default)</span>
              <IconChevron />
            </div>
            <p className="helper-text">Tu monitor será agregado automáticamente al grupo seleccionado</p>
          </div>

          <div className="form-section">
            <label className="section-label">Agregale un nombre</label>
            <input 
            type="text" 
            className="input-field" 
            placeholder="Click para agregar un nombre..." 
            required
            minLength={3}
            value={name} 
            onChange={(e) => setName(e.target.value)}
            />
            <p className="helper-text">Agregale un nombre para que puedas identificarlo mejor</p>
          </div>
        </div>

        <div className="divider"></div>

        <div className="form-section">
          <label className="section-label">¿Cómo te notificaremos?</label>
          
          <div className="notify-grid">
            <div className={`notify-tile ${notify.email ? 'active' : ''}`} onClick={() => toggleNotify('email')}>
              <div className="tile-header">
                <div className={`checkbox-custom ${notify.email ? 'checked' : ''}`}></div>
                <span className="tile-title">E-mail</span>
              </div>
              <div className="tile-subtitle">edgardolucesss@gmail.com</div>
              <div className="tile-footer">
                <IconRefresh /> Sin delay, sin repetición
              </div>
            </div>

            <div className="notify-tile disabled">
              <div className="tile-header">
                <div className="checkbox-custom"></div>
                <span className="tile-title">Mensaje SMS</span>
              </div>
              <div className="tile-subtitle"><a href="#">Agregar número de teléfono</a></div>
              <div className="tile-footer">
                <IconRefresh /> Sin delay, sin repetición
              </div>
            </div>

            <div className="notify-tile disabled">
              <div className="tile-header">
                <div className="checkbox-custom"></div>
                <span className="tile-title">Llamada por voz</span>
              </div>
              <div className="tile-subtitle"><a href="#">Agregar número de teléfono</a></div>
              <div className="tile-footer">
                <IconRefresh /> Sin delay, sin repetición
              </div>
            </div>

             <div className="notify-tile disabled">
              <div className="tile-header">
                <div className="checkbox-custom"></div>
                <span className="tile-title">Push</span>
              </div>
              <div className="tile-subtitle">Descarga la app para <a href="#">iOS</a> o <a href="#">Android</a></div>
              <div className="tile-footer">
                <IconRefresh /> Sin delay, sin repetición
              </div>
            </div>
          </div>
          
          <p className="note-text">
            Podés configurar las notificaciones para <a href="#">Integraciones & Equipo</a> en la pestaña específica y editarla más tarde.
          </p>
        </div>

        <div className="divider"></div>

        <div className="form-section">
          <label className="section-label">Intervalo de monitoreo</label>
          <p className="interval-desc">
            Tu monitor será verificado cada <strong>{INTERVAL_OPTIONS[intervalIndex].label}</strong> ({currentFrequency} segundos). Recomendamos usar al menos 1 minuto de verificación <a href="#">disponible en planes pagos</a>
          </p>

          <div className="slider-container" style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}>
            <input 
              type="range" 
              min="0" 
              max={INTERVAL_OPTIONS.length - 1} 
              step="1"
              value={intervalIndex}
              onChange={(e) => setIntervalIndex(Number(e.target.value))}
              className="custom-range"
            />
            <div className="slider-ticks">
              {INTERVAL_OPTIONS.map((option, i) => (
                <span key={option.label} className={i === intervalIndex ? 'active-tick' : ''}>{option.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="button-add-server">
          <button type="submit"> Agregar monitor </button>
        </div>

      </form>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  )
}

export default MonitorsNewHttp;
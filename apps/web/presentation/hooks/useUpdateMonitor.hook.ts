'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { INTERVAL_OPTIONS } from '@/infraestructure/constants';
import { UpdateUptimeDto } from '@/infraestructure/interfaces';
import useNewMonitor from './useNewMonitor.hook';
import useUptime from './useUptime.hook';

type SubmitOptions = {
  onSuccess?: () => void;
  onError?: () => void;
};

const useUpdateMonitor = () => {
  const { id } = useParams<{ id: string }>();

  const {
    url,
    setUrl,
    name,
    setName,
    intervalIndex,
    setIntervalIndex,
    progressPercent,
    currentFrequency,
    notify,
    setNotify,
  } = useNewMonitor();

  const { uptimeById, updateUptime } = useUptime(id);

  useEffect(() => {
    if (!uptimeById.data) return;

    setName(uptimeById.data.name);
    setUrl(uptimeById.data.url);

    const index = INTERVAL_OPTIONS.findIndex(
      i => i.seconds === uptimeById.data.frequency
    );

    if (index !== -1) {
      setIntervalIndex(index);
    }
  }, [uptimeById.data, setName, setUrl, setIntervalIndex]);

  const submitUpdate = (options?: SubmitOptions) => {
    if (!id) return;

    const body: UpdateUptimeDto = {
      name,
      frequency: currentFrequency,
      isActive: true,
    };

    updateUptime.mutate(
      { id, data: body },
      {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    );
  };

  return {
    url,
    setUrl,
    name,
    setName,
    intervalIndex,
    setIntervalIndex,
    progressPercent,
    currentFrequency,
    notify,
    setNotify,

    uptimeById,
    updateUptime,
    submitUpdate,
  };
};

export default useUpdateMonitor;

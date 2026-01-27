'use client';

import { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { INTERVAL_OPTIONS } from '@/infraestructure/constants';
import { UpdateUptimeDto } from '@/infraestructure/interfaces';
import useNewMonitor from './useNewMonitor.hook';
import useUptime from './useUptime.hook';

type SubmitOptions = {
  onSuccess?: () => void;
  onError?: () => void;
};

interface SubmitDeleteParams extends SubmitOptions {
  id: string;
}

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
    isActive,
    setIsActive,
  } = useNewMonitor();

  const { uptimeById, updateUptime, deleteUptime } = useUptime(id);

  useEffect(() => {
    if (!uptimeById.data) return;

    setName(uptimeById.data.name);
    setUrl(uptimeById.data.url);
    setIsActive(uptimeById.data.isActive);

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
      isActive,
    };

    updateUptime.mutate(
      { id, data: body },
      {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      }
    );
  };

  const submitDelete = useCallback(
  ({ id, onSuccess, onError }: SubmitDeleteParams) => {
     deleteUptime.mutate(id, {
      onSuccess,
      onError,
    });
  },
  [deleteUptime]
);

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
    isActive,
    setIsActive,
    uptimeById,
    updateUptime,
    submitUpdate,
    submitDelete,
  };
};

export default useUpdateMonitor;

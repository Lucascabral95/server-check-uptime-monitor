import { useCallback, useMemo, useState } from 'react'

import { INTERVAL_OPTIONS } from '@/infraestructure/constants';
import { NotifyState } from '@/infraestructure/interfaces';

const useNewMonitor = () => {
  const [url, setUrl] = useState<string>("https://");
  const [name, setName] = useState<string>("");
    const [intervalIndex, setIntervalIndex] = useState<number>(1);
    const [isActive, setIsActive] = useState<boolean>(true);
  
    const progressPercent = useMemo(() => {
      return (intervalIndex / (INTERVAL_OPTIONS.length - 1)) * 100;
    }, [intervalIndex]);
  
    const currentFrequency = useMemo(() => {
      return INTERVAL_OPTIONS[intervalIndex].seconds;
    }, [intervalIndex]);
  
    const [notify, setNotify] = useState<NotifyState>({
      email: true, 
      sms: false, 
      voice: false, 
      push: false
    });

    const cleanup = useCallback(() => {
    setUrl("https://");
    setName("");
    setIntervalIndex(1);
  }, []);

    return {
        url,
        setUrl,
        name,
        setName,
        cleanup,

        intervalIndex, 
        setIntervalIndex,
        progressPercent,
        currentFrequency,
        notify,
        setNotify,
        isActive,
        setIsActive,
    }
}

export default useNewMonitor

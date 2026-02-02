"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { setQueryClient } from './queryClientManager';

const TansTackQueryGlobal = ({children}: {children: React.ReactNode}) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    setQueryClient(queryClient);

    return () => {
      queryClient.clear();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default TansTackQueryGlobal;

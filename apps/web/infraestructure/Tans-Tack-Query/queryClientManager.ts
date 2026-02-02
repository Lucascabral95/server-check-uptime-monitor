import { QueryClient } from '@tanstack/react-query';

let queryClientInstance: QueryClient | null = null;

export const setQueryClient = (client: QueryClient) => {
  queryClientInstance = client;
};

export const clearQueryCache = () => {
  queryClientInstance?.clear();
};

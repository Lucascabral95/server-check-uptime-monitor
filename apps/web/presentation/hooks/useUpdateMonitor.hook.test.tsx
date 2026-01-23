import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { useParams } from 'next/navigation';

import useUpdateMonitor from './useUpdateMonitor.hook';
import useUptime from './useUptime.hook';
import { INTERVAL_OPTIONS } from '@/infraestructure/constants';
import { Status, GetUptimeDto } from '@/infraestructure/interfaces';

/* ---------------------------------- */
/* Mocks                              */
/* ---------------------------------- */

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

vi.mock('./useUptime.hook', () => ({
  default: vi.fn(),
}));

// Stateful mock data that tracks changes
const mockState = {
  url: 'https://',
  name: '',
  intervalIndex: 1,
};

const mockSetUrl = (url: string) => { mockState.url = url; };
const mockSetName = (name: string) => { mockState.name = name; };
const mockSetIntervalIndex = (index: number) => { mockState.intervalIndex = index; };

vi.mock('./useNewMonitor.hook', () => ({
  default: vi.fn(() => ({
    get url() { return mockState.url; },
    get name() { return mockState.name; },
    get intervalIndex() { return mockState.intervalIndex; },
    get progressPercent() { return (mockState.intervalIndex / 5) * 100; },
    setUrl: mockSetUrl,
    setName: mockSetName,
    setIntervalIndex: mockSetIntervalIndex,
    currentFrequency: 60,
    notify: { email: true, sms: false, voice: false, push: false },
    setNotify: vi.fn(),
  })),
}));

const mockUseParams = useParams as unknown as ReturnType<typeof vi.fn>;
const mockUseUptime = useUptime as unknown as ReturnType<typeof vi.fn>;

/* ---------------------------------- */
/* Utils                              */
/* ---------------------------------- */

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const mockMonitorData: GetUptimeDto = {
  id: '123',
  userId: 'user-1',
  name: 'Test Monitor',
  url: 'https://test.com',
  frequency: 60,
  isActive: true,
  nextCheck: new Date(),
  lastCheck: new Date(),
  status: Status.UP,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/* ---------------------------------- */
/* Tests                              */
/* ---------------------------------- */

describe('useUpdateMonitor hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mock state
    mockState.url = 'https://';
    mockState.name = '';
    mockState.intervalIndex = 1;

    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ id: '123' });

    mockUseUptime.mockReturnValue({
      uptimeById: {
        data: mockMonitorData,
        isLoading: false,
        isError: false,
        isSuccess: true,
      },
      updateUptime: {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
      },
    });
  });

  it('should initialize correctly', () => {
    const { result } = renderHook(() => useUpdateMonitor(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current).toHaveProperty('url');
    expect(result.current).toHaveProperty('name');
    expect(result.current).toHaveProperty('intervalIndex');
    expect(result.current).toHaveProperty('submitUpdate');
  });

  it('should populate form when uptime data loads', async () => {
    const { result } = renderHook(() => useUpdateMonitor(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.name).toBeDefined();
    });
  });

  it('should set interval index based on frequency', async () => {
  const freq = INTERVAL_OPTIONS[2].seconds;

  mockUseUptime.mockReturnValue({
    uptimeById: {
      data: { ...mockMonitorData, frequency: freq },
      isLoading: false,
      isError: false,
      isSuccess: true,
    },
    updateUptime: {
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    },
  });

  renderHook(() => useUpdateMonitor(), {
    wrapper: createWrapper(queryClient),
  });

  await waitFor(() => {
    const expectedIndex = INTERVAL_OPTIONS.findIndex(
      i => i.seconds === freq
    );

    expect(mockState.intervalIndex).toBe(expectedIndex);
  });
});

  it('should not submit if id is missing', () => {
    mockUseParams.mockReturnValue({});

    const mutate = vi.fn();

    mockUseUptime.mockReturnValue({
      uptimeById: {
        data: mockMonitorData,
        isLoading: false,
        isError: false,
        isSuccess: true,
      },
      updateUptime: {
        mutate,
        isPending: false,
      },
    });

    const { result } = renderHook(() => useUpdateMonitor(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.submitUpdate();
    });

    expect(mutate).not.toHaveBeenCalled();
  });

  it('should expose mutation states', () => {
    mockUseUptime.mockReturnValue({
      uptimeById: {
        data: mockMonitorData,
        isLoading: false,
        isError: false,
        isSuccess: true,
      },
      updateUptime: {
        mutate: vi.fn(),
        isPending: true,
        isError: true,
      },
    });

    const { result } = renderHook(() => useUpdateMonitor(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.updateUptime.isPending).toBe(true);
    expect(result.current.updateUptime.isError).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import useUptime from './useUptime.hook'
import * as api from '@/lib/Resources/Api'
import type { CreateUptimeDto, UpdateUptimeDto } from '@/infraestructure/interfaces'

vi.mock('@/lib/Resources/Api')

describe('useUptime hook', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    vi.clearAllMocks()
  })

  it('fetches all uptimes', async () => {
    const mockResponse = {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        nextPage: false,
        prevPage: false,
      },
    }

    vi.mocked(api.getAllUptimes).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUptime(), { wrapper })

    await waitFor(() => {
      expect(result.current.uptimes.isSuccess).toBe(true)
    })

    expect(api.getAllUptimes).toHaveBeenCalled()
    expect(result.current.uptimes.data).toEqual(mockResponse)
  })

  it('fetches uptime by id', async () => {
    const mockUptime = { id: '1', name: 'Monitor 1' }

    vi.mocked(api.getUptimeById).mockResolvedValue(mockUptime as any)

    const { result } = renderHook(() => useUptime('1'), { wrapper })

    await waitFor(() => {
      expect(result.current.uptimeById.isSuccess).toBe(true)
    })

    expect(api.getUptimeById).toHaveBeenCalledWith('1')
    expect(result.current.uptimeById.data).toEqual(mockUptime)
  })

  it('creates uptime', async () => {
    const newUptime: CreateUptimeDto = {
      name: 'Test',
      url: 'https://test.com',
      frequency: 60,
    }

    vi.mocked(api.createUptime).mockResolvedValue({ id: '1', ...newUptime } as any)

    const { result } = renderHook(() => useUptime(), { wrapper })

    result.current.createUptime.mutate(newUptime)

    await waitFor(() => {
      expect(result.current.createUptime.isSuccess).toBe(true)
    })

    expect(api.createUptime).toHaveBeenCalledWith(newUptime)
  })

  it('updates uptime', async () => {
    const update: UpdateUptimeDto = { name: 'Updated' }

    vi.mocked(api.updateUptimeById).mockResolvedValue({ id: '1', ...update } as any)

    const { result } = renderHook(() => useUptime(), { wrapper })

    result.current.updateUptime.mutate({ id: '1', data: update })

    await waitFor(() => {
      expect(result.current.updateUptime.isSuccess).toBe(true)
    })

    expect(api.updateUptimeById).toHaveBeenCalledWith('1', update)
  })

  it('deletes uptime', async () => {
    vi.mocked(api.deleteUptimeById).mockResolvedValue(undefined)

    const { result } = renderHook(() => useUptime(), { wrapper })

    result.current.deleteUptime.mutate('1')

    await waitFor(() => {
      expect(result.current.deleteUptime.isSuccess).toBe(true)
    })

    expect(api.deleteUptimeById).toHaveBeenCalledWith('1')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import usePingLogs from './usePingLogs.hook'
import * as api from '@/lib/Resources/Api'

vi.mock('@/lib/Resources/Api')

describe('usePingLogs', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

  describe('Queries', () => {
    it('does not fetch all ping logs by default (ADMIN-only endpoint)', () => {
      const { result } = renderHook(() => usePingLogs(), { wrapper })

      expect(result.current.allPingLogs.fetchStatus).toBe('idle')
      expect(api.getAllPingLogs).not.toHaveBeenCalled()
    })

    it('fetches all ping logs when enableAdminList is true', async () => {
      const mockData = {
        data: [
          { id: '1', monitorId: 'm1', statusCode: 200, durationMs: 100, success: true, timestamp: new Date(), createdAt: new Date(), updatedAt: new Date() },
          { id: '2', monitorId: 'm1', statusCode: 500, durationMs: 200, success: false, timestamp: new Date(), createdAt: new Date(), updatedAt: new Date() },
        ],
        pagination: { currentPage: 1, totalPages: 1, nextPage: null, prevPage: null, totalItems: 2, itemsPerPage: 10 },
      }
      vi.mocked(api.getAllPingLogs).mockResolvedValue(mockData)

      const { result } = renderHook(
        () => usePingLogs(undefined, undefined, { enableAdminList: true }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.allPingLogs.isSuccess).toBe(true))

      expect(result.current.allPingLogs.data).toEqual(mockData)
      expect(api.getAllPingLogs).toHaveBeenCalledTimes(1)
    })

    it('fetches ping log by id when id is provided', async () => {
      const mockData = { id: '1', statusCode: 200, durationMs: 100, success: true }
      vi.mocked(api.getPingLogById).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePingLogs('1'), { wrapper })

      await waitFor(() => expect(result.current.pingLogById.isSuccess).toBe(true))

      expect(result.current.pingLogById.data).toEqual(mockData)
      expect(api.getPingLogById).toHaveBeenCalledWith('1')
    })

    it('does not fetch ping log by id when id is not provided', () => {
      const { result } = renderHook(() => usePingLogs(), { wrapper })

      expect(result.current.pingLogById.fetchStatus).toBe('idle')
      expect(api.getPingLogById).not.toHaveBeenCalled()
    })

    it('fetches user ping logs with params', async () => {
      const mockData = { data: [], pagination: { totalItems: 0 } }
      vi.mocked(api.findAllPingLogsById).mockResolvedValue(mockData)

      const params = { page: 1, limit: 10 }
      const { result } = renderHook(() => usePingLogs(undefined, params), { wrapper })

      await waitFor(() => expect(result.current.userPingLogs.isSuccess).toBe(true))

      expect(api.findAllPingLogsById).toHaveBeenCalledWith(params)
    })

    it('handles query errors when enableAdminList is true', async () => {
      vi.mocked(api.getAllPingLogs).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(
        () => usePingLogs(undefined, undefined, { enableAdminList: true }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.allPingLogs.isError).toBe(true))

      expect(result.current.allPingLogs.error).toBeTruthy()
    })
  })

  describe('Mutations', () => {
    it('deletes ping log successfully and invalidates queries', async () => {
      vi.mocked(api.deletePingLogById).mockResolvedValue(undefined)

      const { result } = renderHook(() => usePingLogs(), { wrapper })

      result.current.deletePingLog.mutate('1')

      await waitFor(() => expect(result.current.deletePingLog.isSuccess).toBe(true))

      expect(api.deletePingLogById).toHaveBeenCalledWith('1')
    })

    it('handles delete mutation errors', async () => {
      vi.mocked(api.deletePingLogById).mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => usePingLogs(), { wrapper })

      result.current.deletePingLog.mutate('1')

      await waitFor(() => expect(result.current.deletePingLog.isError).toBe(true))

      expect(result.current.deletePingLog.error).toBeTruthy()
    })
  })
})

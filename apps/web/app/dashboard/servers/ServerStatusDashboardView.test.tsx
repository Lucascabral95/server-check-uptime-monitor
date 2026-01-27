import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import ServerStatusDashboardView from './ServerStatusDashboardView'

const mockRefetchUptimes = vi.fn()
const mockRefetchStats = vi.fn()

vi.mock('@/presentation/hooks/useUptime.hook', () => ({
  default: vi.fn(),
}))

vi.mock('@/presentation/components/Dashboard/Home/StatusUptimes/StatusUptimes', () => ({
  default: ({ data }: { data: any[] }) => (
    <div data-testid="status-uptimes">
      StatusUptimes rendered ({data.length})
    </div>
  ),
}))

vi.mock('@/presentation/components/shared/states/LoadingState', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="loading-state">{message}</div>
  ),
}))

vi.mock('@/presentation/components/shared/states/ErrorState', () => ({
  default: ({ title, description, onRetry }: any) => (
    <div data-testid="error-state">
      <h1>{title}</h1>
      <p>{description}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}))

import useUptime from '@/presentation/hooks/useUptime.hook'
const mockedUseUptime = useUptime as unknown as ReturnType<typeof vi.fn>

const createHookState = (overrides?: Partial<any>) => ({
  uptimes: {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: mockRefetchUptimes,
    ...overrides?.uptimes,
  },
  myStats: {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: mockRefetchStats,
    ...overrides?.myStats,
  },
})

describe('ServerStatusDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state while data is loading initially', () => {
    mockedUseUptime.mockReturnValue(
      createHookState({
        uptimes: { isLoading: true, data: undefined },
        myStats: { isLoading: true, data: undefined },
      })
    )

    render(<ServerStatusDashboardView />)

    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    expect(screen.getByText('Cargando monitoreos...')).toBeInTheDocument()
  })

  it('renders error state when uptimes or stats fail', () => {
    mockedUseUptime.mockReturnValue(
      createHookState({
        uptimes: { isError: true },
      })
    )

    render(<ServerStatusDashboardView />)

    expect(screen.getByTestId('error-state')).toBeInTheDocument()
    expect(screen.getByText('Error al cargar el dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        'No pudimos obtener los datos de tus monitoreos. Intentá nuevamente.'
      )
    ).toBeInTheDocument()
  })

  it('calls refetch on retry', () => {
    mockedUseUptime.mockReturnValue(
      createHookState({
        uptimes: { isError: true },
        myStats: { isError: false },
      })
    )

    render(<ServerStatusDashboardView />)

    fireEvent.click(screen.getByText('Retry'))

    expect(mockRefetchUptimes).toHaveBeenCalledTimes(1)
    expect(mockRefetchStats).toHaveBeenCalledTimes(1)
  })

  it('renders dashboard and StatusUptimes when data is available', () => {
    mockedUseUptime.mockReturnValue(
      createHookState({
        uptimes: {
          data: [
            { id: '1', url: 'https://test.com', status: 'UP' },
            { id: '2', url: 'https://test2.com', status: 'DOWN' },
          ],
        },
        myStats: {
          data: { total: 2 },
        },
      })
    )

    render(<ServerStatusDashboardView />)

    expect(screen.getByText('Estado de servidores')).toBeInTheDocument()
    expect(screen.getByTestId('status-uptimes')).toBeInTheDocument()
    expect(screen.getByText('StatusUptimes rendered (2)')).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import MonitorsDetailsById from './page'
import useMonitorByIdWithStatsLogs from '@/presentation/hooks/useMonitorByIdWithStatsLogs'

vi.mock('@/presentation/hooks/useMonitorByIdWithStatsLogs', () => ({
  default: vi.fn(),
}))

vi.mock('@/presentation/components/shared/states/LoadingState', () => ({
  default: ({ message }: any) => (
    <div data-testid="loading-state">{message}</div>
  ),
}))

vi.mock('@/presentation/components/shared/states/ErrorState', () => ({
  default: ({ title, onRetry }: any) => (
    <div>
      <p>{title}</p>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  ),
}))

vi.mock('@/presentation/components/Dashboard/Home/DetailsUptime/MonitorDetailsHeader', () => ({
  default: ({ monitor, handleOpenUrl }: any) => (
    <div data-testid="monitor-details-header">
      <span>{monitor.name}</span>
      <button onClick={handleOpenUrl}>open-url</button>
    </div>
  ),
}))

vi.mock('@/presentation/components/Dashboard/Home/DetailsUptime/MonitorStatsOverview', () => ({
  default: ({ stats24h }: any) => (
    <div data-testid="monitor-stats">
      {stats24h?.length ?? 0} stats
    </div>
  ),
}))

vi.mock('@/presentation/components/Dashboard/Home/DetailsUptime/LatestIncidents', () => ({
  default: ({ handleMoreIncidents, countLimitIncidents }: any) => (
    <div data-testid="latest-incidents">
      <span>{countLimitIncidents}</span>
      <button onClick={handleMoreIncidents}>more</button>
    </div>
  ),
}))

vi.mock('react-icons/io', () => ({
  IoIosArrowBack: () => <div data-testid="arrow-back-icon" />,
}))

vi.mock('./MonitorsDetails.scss', () => ({}))

const mockUseMonitorByIdWithStatsLogs =
  useMonitorByIdWithStatsLogs as unknown as ReturnType<typeof vi.fn>

describe('MonitorsDetailsById', () => {
  const baseHookMock = {
    data: {
      id: '1',
      name: 'Monitor Test',
      url: 'https://test.com',
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    redirectToLink: vi.fn(),
    handleDetailsMonitor: vi.fn(),
    stats24h: [{ time: '10:00', status: 'up' }],
    errorLogs: [{ id: 'e1', message: 'Error 500' }],
    handleMoreIncidents: vi.fn(),
    countLimitIncidents: 5,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMonitorByIdWithStatsLogs.mockReturnValue(baseHookMock)
  })

  it('renderiza loading state', () => {
    mockUseMonitorByIdWithStatsLogs.mockReturnValue({
      ...baseHookMock,
      isLoading: true,
    })

    render(<MonitorsDetailsById />)

    expect(
      screen.getByTestId('loading-state')
    ).toHaveTextContent('Cargando monitoreo...')
  })

  it('renderiza error state y permite reintentar', () => {
    const refetch = vi.fn()

    mockUseMonitorByIdWithStatsLogs.mockReturnValue({
      ...baseHookMock,
      isError: true,
      refetch,
    })

    render(<MonitorsDetailsById />)

    expect(
      screen.getByText('Error al cargar el monitoreo')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByText('Reintentar'))
    expect(refetch).toHaveBeenCalled()
  })

  it('renderiza correctamente el detalle del monitor', () => {
    render(<MonitorsDetailsById />)

    expect(screen.getByText('Monitoreos')).toBeInTheDocument()
    expect(screen.getByTestId('monitor-details-header')).toBeInTheDocument()
    expect(screen.getByTestId('monitor-stats')).toBeInTheDocument()
    expect(screen.getByTestId('latest-incidents')).toBeInTheDocument()
  })

  it('dispara navegación al hacer click en volver', () => {
    render(<MonitorsDetailsById />)

    fireEvent.click(screen.getByText('Monitoreos'))

    expect(baseHookMock.handleDetailsMonitor).toHaveBeenCalled()
  })

  it('dispara redirectToLink desde MonitorDetailsHeader', () => {
    render(<MonitorsDetailsById />)

    fireEvent.click(screen.getByText('open-url'))

    expect(baseHookMock.redirectToLink).toHaveBeenCalled()
  })

  it('dispara handleMoreIncidents desde LatestIncidents', () => {
    render(<MonitorsDetailsById />)

    fireEvent.click(screen.getByText('more'))

    expect(baseHookMock.handleMoreIncidents).toHaveBeenCalled()
  })

  it('pasa correctamente countLimitIncidents a LatestIncidents', () => {
    render(<MonitorsDetailsById />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

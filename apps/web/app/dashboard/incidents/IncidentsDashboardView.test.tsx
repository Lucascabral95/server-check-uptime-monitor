import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import IncidentsDashboard from './page'
import useFilteredIncidents from '@/presentation/hooks/useFilteredIncidents.hook'

vi.mock('@/presentation/hooks/useFilteredIncidents.hook', () => ({
  default: vi.fn(),
}))

vi.mock('@/presentation/components/Dashboard/Home/Incidents/TableIncidents', () => ({
  default: ({ data }: any) => (
    <div data-testid="incidents-table">
      {data.incidents.length} incidents
    </div>
  ),
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

vi.mock('@/presentation/components/Filters/FiltersMonitor/FiltersIncidents', () => ({
  default: (props: any) => (
    <div data-testid="filters-incidents">
      <button onClick={() => props.onSearchChange('test')}>
        search
      </button>
      <button onClick={() => props.onSortChange('DATE_DESC')}>
        sort
      </button>
      <button onClick={props.onClearSearch}>
        clear
      </button>
      <span data-testid="incident-count">
        {props.incidentCount}
      </span>
    </div>
  ),
}))

vi.mock('./Incidents.scss', () => ({}))

const mockUseFilteredIncidents = useFilteredIncidents as unknown as ReturnType<typeof vi.fn>

describe('IncidentsDashboard', () => {
  const baseHookMock = {
    data: {
      incidents: [
        { id: '1', title: 'Incident 1' },
        { id: '2', title: 'Incident 2' },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    searchIncident: '',
    selectedSort: null,
    handleSearchChange: vi.fn(),
    handleSortChange: vi.fn(),
    onClearSearch: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFilteredIncidents.mockReturnValue(baseHookMock)
  })

  it('renderiza loading state', () => {
    mockUseFilteredIncidents.mockReturnValue({
      ...baseHookMock,
      isLoading: true,
    })

    render(<IncidentsDashboard />)

    expect(
      screen.getByTestId('loading-state')
    ).toHaveTextContent('Cargando incidentes...')
  })

  it('renderiza error state y permite reintentar', () => {
    const refetch = vi.fn()

    mockUseFilteredIncidents.mockReturnValue({
      ...baseHookMock,
      isError: true,
      refetch,
    })

    render(<IncidentsDashboard />)

    expect(
      screen.getByText('Error al obtener los incidentes')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByText('Reintentar'))
    expect(refetch).toHaveBeenCalled()
  })

  it('renderiza el dashboard correctamente', () => {
    render(<IncidentsDashboard />)

    expect(screen.getByText('Incidentes')).toBeInTheDocument()
    expect(screen.getByTestId('filters-incidents')).toBeInTheDocument()
    expect(screen.getByTestId('incidents-table')).toBeInTheDocument()
  })

  it('pasa correctamente el incidentCount a FiltersIncidents', () => {
    render(<IncidentsDashboard />)

    expect(screen.getByTestId('incident-count')).toHaveTextContent('2')
  })

  it('dispara handleSearchChange desde FiltersIncidents', () => {
    render(<IncidentsDashboard />)

    fireEvent.click(screen.getByText('search'))

    expect(baseHookMock.handleSearchChange).toHaveBeenCalledWith('test')
  })

  it('dispara handleSortChange desde FiltersIncidents', () => {
    render(<IncidentsDashboard />)

    fireEvent.click(screen.getByText('sort'))

    expect(baseHookMock.handleSortChange).toHaveBeenCalledWith('DATE_DESC')
  })

  it('dispara onClearSearch desde FiltersIncidents', () => {
    render(<IncidentsDashboard />)

    fireEvent.click(screen.getByText('clear'))

    expect(baseHookMock.onClearSearch).toHaveBeenCalled()
  })
})

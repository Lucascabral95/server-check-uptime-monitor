import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FiltersIncidents from './FiltersIncidents'
import { SortBy } from '@/infraestructure/interfaces'

vi.mock('./SortIncidentsInside', () => ({
  default: ({ onApply }: any) => (
    <div>
      <button onClick={() => onApply(SortBy.RECENT)}>
        Más recientes
      </button>
      <button onClick={() => onApply(null)}>
        Limpiar
      </button>
    </div>
  ),
}))

vi.mock('./FiltersMonitor.scss', () => ({}))

describe('FiltersIncidents', () => {
  const mockOnSearchChange = vi.fn()
  const mockOnSortChange = vi.fn()
  const mockOnClearSearch = vi.fn()

  const defaultProps = {
    searchValue: '',
    selectedSort: null,
    onSearchChange: mockOnSearchChange,
    onSortChange: mockOnSortChange,
    onClearSearch: mockOnClearSearch,
    incidentCount: 5,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders incident count correctly', () => {
    render(<FiltersIncidents {...defaultProps} />)

    expect(screen.getByText('5 Incidentes')).toBeInTheDocument()
  })

  it('renders singular form when count is 1', () => {
    render(<FiltersIncidents {...defaultProps} incidentCount={1} />)

    expect(screen.getByText('1 Incidente')).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', () => {
    render(<FiltersIncidents {...defaultProps} />)

    const input = screen.getByPlaceholderText(
      'Buscar por nombre o URL del monitor...'
    )

    fireEvent.change(input, { target: { value: 'timeout' } })

    expect(mockOnSearchChange).toHaveBeenCalledWith('timeout')
  })

  it('shows clear button and clears search when clicked', () => {
    render(
      <FiltersIncidents
        {...defaultProps}
        searchValue="timeout"
      />
    )

    fireEvent.click(screen.getByLabelText('Limpiar búsqueda'))

    expect(mockOnClearSearch).toHaveBeenCalled()
  })

  it('opens sort dropdown when clicked', () => {
    render(<FiltersIncidents {...defaultProps} />)

    fireEvent.click(screen.getByText('Ordenar'))

    expect(screen.getByText('Más recientes')).toBeInTheDocument()
  })

  it('applies sort when option selected', () => {
    render(<FiltersIncidents {...defaultProps} />)

    fireEvent.click(screen.getByText('Ordenar'))
    fireEvent.click(screen.getByText('Más recientes'))

    expect(mockOnSortChange).toHaveBeenCalledWith(SortBy.RECENT)
  })

  it('clears sort when clear option selected', () => {
    render(
      <FiltersIncidents
        {...defaultProps}
        selectedSort={SortBy.RECENT}
      />
    )

    fireEvent.click(screen.getByText('Ordenar'))
    fireEvent.click(screen.getByText('Limpiar'))

    expect(mockOnSortChange).toHaveBeenCalledWith(null)
  })

  it('shows filter badge when filters are active', () => {
    render(
      <FiltersIncidents
        {...defaultProps}
        searchValue="timeout"
        selectedSort={SortBy.RECENT}
      />
    )

    const badge = screen
      .getByText('Ordenar')
      .closest('.sort-by-status')
      ?.querySelector('.filter-badge')

    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('2')
  })

  it('shows sort indicator when sort is selected', () => {
    render(
      <FiltersIncidents
        {...defaultProps}
        selectedSort={SortBy.RECENT}
      />
    )

    const indicator = screen
      .getByText('Ordenar')
      .closest('.sort-by-status')
      ?.querySelector('.sort-indicator')

    expect(indicator).toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', () => {
    render(<FiltersIncidents {...defaultProps} />)

    fireEvent.click(screen.getByText('Ordenar'))
    expect(screen.getByText('Más recientes')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByText('Más recientes')).not.toBeInTheDocument()
  })
})

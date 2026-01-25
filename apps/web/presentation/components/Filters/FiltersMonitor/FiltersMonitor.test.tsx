import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FiltersMonitor from './FiltersMonitor'
import { Status, SortBy } from '@/infraestructure/interfaces'

describe('FiltersMonitor', () => {
  const mockOnSearchChange = vi.fn()
  const mockOnStatusChange = vi.fn()
  const mockOnSortChange = vi.fn()
  const mockOnClearSearch = vi.fn()

  const defaultProps = {
    searchValue: '',
    selectedStatus: null,
    selectedSort: null,
    onSearchChange: mockOnSearchChange,
    onStatusChange: mockOnStatusChange,
    onSortChange: mockOnSortChange,
    onClearSearch: mockOnClearSearch,
    monitorCount: 5,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders monitor count correctly', () => {
    render(<FiltersMonitor {...defaultProps} />)
    expect(screen.getByText('5 Monitores')).toBeInTheDocument()
  })

  it('renders singular form when count is 1', () => {
    render(<FiltersMonitor {...defaultProps} monitorCount={1} />)
    expect(screen.getByText('1 Monitoreo')).toBeInTheDocument()
  })

  it('opens filter dropdown when clicked', () => {
    render(<FiltersMonitor {...defaultProps} />)

    fireEvent.click(screen.getByText('Filtrar'))

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Operativos')).toBeInTheDocument()
    expect(screen.getByText('Fallidos')).toBeInTheDocument()
  })

  it('opens sort dropdown when clicked', () => {
    render(<FiltersMonitor {...defaultProps} />)

    fireEvent.click(screen.getByText('Ordenar'))

    expect(screen.getByText('Orden alfabético')).toBeInTheDocument()
    expect(screen.getByText('Orden por fecha')).toBeInTheDocument()
    expect(screen.getByText('Orden por estado')).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', () => {
    render(<FiltersMonitor {...defaultProps} />)

    const input = screen.getByPlaceholderText('Buscar por nombre o URL...')
    fireEvent.change(input, { target: { value: 'test' } })

    expect(mockOnSearchChange).toHaveBeenCalledWith('test')
  })

  it('clears search when clear button is clicked', () => {
    render(<FiltersMonitor {...defaultProps} searchValue="test" />)

    fireEvent.click(screen.getByLabelText('Limpiar búsqueda'))

    expect(mockOnClearSearch).toHaveBeenCalled()
  })

  it('applies status filter when option selected', () => {
    render(<FiltersMonitor {...defaultProps} />)

    fireEvent.click(screen.getByText('Filtrar'))
    fireEvent.click(screen.getByText('Operativos'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnStatusChange).toHaveBeenCalledWith(Status.UP)
  })

  it('applies ALL status correctly', () => {
    render(<FiltersMonitor {...defaultProps} selectedStatus={Status.UP} />)

    fireEvent.click(screen.getByText('Filtrar'))
    fireEvent.click(screen.getByText('Todos'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnStatusChange).toHaveBeenCalledWith(null)
  })

  it('applies sort filter when option selected', () => {
    render(<FiltersMonitor {...defaultProps} />)

    fireEvent.click(screen.getByText('Ordenar'))
    fireEvent.click(screen.getByText('A => Z'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnSortChange).toHaveBeenCalledWith(SortBy.NAME_ASC)
  })

  it('shows filter badge when filters are active', () => {
    render(
      <FiltersMonitor
        {...defaultProps}
        searchValue="test"
        selectedStatus={Status.UP}
      />
    )

    const filterButton = screen.getByText('Filtrar').closest('.filter-of-monitors')!
    expect(filterButton.querySelector('.filter-badge')).toBeInTheDocument()
  })

  it('closes dropdowns when clicking outside', () => {
    render(<FiltersMonitor {...defaultProps} />)

    fireEvent.click(screen.getByText('Filtrar'))
    expect(screen.getByText('Todos')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByText('Todos')).not.toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FiltersMonitor from './FiltersMonitor'
import { Status, SortBy } from '@/infraestructure/interfaces'

describe('FiltersMonitor', () => {
  const mockOnFiltersChange = vi.fn()
  const defaultProps = {
    onFiltersChange: mockOnFiltersChange,
    monitorCount: 5
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
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
    const filterButton = screen.getByText('Filtrar').closest('.filter-of-monitors')
    fireEvent.click(filterButton!)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Operativos')).toBeInTheDocument()
    expect(screen.getByText('Fallidos')).toBeInTheDocument()
  })

  it('opens sort dropdown when clicked', () => {
    render(<FiltersMonitor {...defaultProps} />)
    const sortButton = screen.getByText('Ordenar').closest('.sort-by-status')
    fireEvent.click(sortButton!)

    expect(screen.getByText('Orden alfabético')).toBeInTheDocument()
    expect(screen.getByText('Orden por fecha')).toBeInTheDocument()
    expect(screen.getByText('Orden por estado')).toBeInTheDocument()
  })

  it('handles search input with debounce', () => {
    render(<FiltersMonitor {...defaultProps} />)
    const searchInput = screen.getByPlaceholderText('Buscar por nombre o URL...')

    fireEvent.change(searchInput, { target: { value: 'test' } })

    expect(mockOnFiltersChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    vi.runOnlyPendingTimers()

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'test', status: null, sortBy: null })
  })

  it('clears search when clear button is clicked', () => {
    render(<FiltersMonitor {...defaultProps} />)
    const searchInput = screen.getByPlaceholderText('Buscar por nombre o URL...')

    fireEvent.change(searchInput, { target: { value: 'test' } })
    vi.advanceTimersByTime(300)
    vi.runOnlyPendingTimers()

    const clearButton = screen.getByLabelText('Limpiar búsqueda')
    fireEvent.click(clearButton)

    expect(searchInput).toHaveValue('')
    // The debounce will trigger again with empty value (becomes undefined)
    vi.advanceTimersByTime(300)
    vi.runOnlyPendingTimers()
    expect(mockOnFiltersChange).toHaveBeenLastCalledWith({ search: undefined, status: null, sortBy: null })
  })

  it('applies status filter when option selected', () => {
    render(<FiltersMonitor {...defaultProps} />)

    const filterButton = screen.getByText('Filtrar').closest('.filter-of-monitors')
    fireEvent.click(filterButton!)
    fireEvent.click(screen.getByText('Operativos'))
    fireEvent.click(screen.getByText('Aplicar'))

    vi.advanceTimersByTime(300)
    vi.runOnlyPendingTimers()

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: undefined, status: Status.UP, sortBy: null })
  })

  it('applies sort filter when option selected', () => {
    render(<FiltersMonitor {...defaultProps} />)

    const sortButton = screen.getByText('Ordenar').closest('.sort-by-status')
    fireEvent.click(sortButton!)
    fireEvent.click(screen.getByText('A => Z'))
    fireEvent.click(screen.getByText('Aplicar'))

    vi.advanceTimersByTime(300)
    vi.runOnlyPendingTimers()

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: undefined, status: null, sortBy: SortBy.NAME_ASC })
  })

  it('shows filter badge when filters are active', () => {
    render(<FiltersMonitor {...defaultProps} monitorCount={1} />)
    const filterButton = screen.getByText('Filtrar').closest('.filter-of-monitors')!

    expect(filterButton.querySelector('.filter-badge')).not.toBeInTheDocument()

    fireEvent.click(filterButton)
    fireEvent.click(screen.getByText('Operativos'))
    fireEvent.click(screen.getByText('Aplicar'))

    vi.advanceTimersByTime(300)
    vi.runOnlyPendingTimers()

    expect(filterButton.querySelector('.filter-badge')).toBeInTheDocument()
  })

  it('closes dropdowns when clicking outside', () => {
    render(<FiltersMonitor {...defaultProps} />)

    const filterButton = screen.getByText('Filtrar').closest('.filter-of-monitors')
    fireEvent.click(filterButton!)
    expect(screen.getByText('Todos')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    vi.runOnlyPendingTimers()

    expect(screen.queryByText('Todos')).not.toBeInTheDocument()
  })

  it('applies ALL status correctly', () => {
    render(<FiltersMonitor {...defaultProps} />)

    const filterButton = screen.getByText('Filtrar').closest('.filter-of-monitors')
    fireEvent.click(filterButton!)
    fireEvent.click(screen.getByText('Todos'))
    fireEvent.click(screen.getByText('Aplicar'))

    vi.advanceTimersByTime(300)
    vi.runOnlyPendingTimers()

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: undefined, status: null, sortBy: null })
  })
})

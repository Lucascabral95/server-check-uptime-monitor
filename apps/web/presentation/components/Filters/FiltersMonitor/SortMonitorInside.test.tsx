import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SortMonitorInside from './SortMonitorInside'
import { SortBy } from '@/infraestructure/interfaces'

describe('SortMonitorInside', () => {
  const mockOnClose = vi.fn()
  const mockOnApply = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all sort groups', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    expect(screen.getByText('Orden alfabético')).toBeInTheDocument()
    expect(screen.getByText('Orden por fecha')).toBeInTheDocument()
    expect(screen.getByText('Orden por estado')).toBeInTheDocument()
  })

  it('renders all sort options in correct groups', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    expect(screen.getByText('A => Z')).toBeInTheDocument()
    expect(screen.getByText('Z => A')).toBeInTheDocument()
    expect(screen.getByText('Más recientes primero')).toBeInTheDocument()
    expect(screen.getByText('Más antiguos primero')).toBeInTheDocument()
    expect(screen.getByText('Operativos primero')).toBeInTheDocument()
    expect(screen.getByText('Fallidos primero')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const { container } = render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    const closeButton = container.querySelector('.button')
    fireEvent.click(closeButton!)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('selects and applies NAME_ASC sort', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('A => Z'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(SortBy.NAME_ASC)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('selects and applies NAME_DESC sort', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Z => A'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(SortBy.NAME_DESC)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('selects and applies RECENT sort', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Más recientes primero'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(SortBy.RECENT)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('selects and applies OLDEST sort', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Más antiguos primero'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(SortBy.OLDEST)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('selects and applies STATUS_UP sort', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Operativos primero'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(SortBy.STATUS_UP)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('selects and applies STATUS_DOWN sort', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Fallidos primero'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(SortBy.STATUS_DOWN)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('resets selection and closes when Cancelar is clicked', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('A => Z'))
    fireEvent.click(screen.getByText('Cancelar'))

    expect(mockOnApply).not.toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows check indicator for selected option', () => {
    render(<SortMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    expect(screen.queryByText('✓')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('A => Z'))

    expect(screen.getByText('A => Z').parentElement).toContainHTML('✓')
  })

  it('highlights initial sort when provided', () => {
    render(
      <SortMonitorInside
        onClose={mockOnClose}
        onApply={mockOnApply}
        initialSort={SortBy.NAME_ASC}
      />
    )

    const nameAscOption = screen.getByText('A => Z').closest('div')
    expect(nameAscOption).toHaveClass('active')
  })
})

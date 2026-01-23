import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterMonitorInside from './FilterMonitorInside'
import { Status } from '@/infraestructure/interfaces'

describe('FilterMonitorInside', () => {
  const mockOnClose = vi.fn()
  const mockOnApply = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all status options', () => {
    render(<FilterMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Operativos')).toBeInTheDocument()
    expect(screen.getByText('Fallidos')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const { container } = render(<FilterMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    const closeButton = container.querySelector('.button')
    fireEvent.click(closeButton!)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('selects status when option is clicked', () => {
    render(<FilterMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    const upOption = screen.getByText('Operativos').closest('div')
    fireEvent.click(upOption!)

    expect(upOption).toHaveClass('active')
  })

  it('applies UP status and closes', () => {
    render(<FilterMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Operativos'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(Status.UP)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('applies DOWN status and closes', () => {
    render(<FilterMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Fallidos'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(Status.DOWN)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('applies ALL (null) status when Todos is selected', () => {
    render(<FilterMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Todos'))
    fireEvent.click(screen.getByText('Aplicar'))

    expect(mockOnApply).toHaveBeenCalledWith(null)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('resets selection and closes when Cancelar is clicked', () => {
    render(<FilterMonitorInside onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.click(screen.getByText('Operativos'))
    fireEvent.click(screen.getByText('Cancelar'))

    expect(mockOnApply).not.toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('highlights initial status when provided', () => {
    render(
      <FilterMonitorInside
        onClose={mockOnClose}
        onApply={mockOnApply}
        initialStatus={Status.UP}
      />
    )

    const upOption = screen.getByText('Operativos').closest('div')
    expect(upOption).toHaveClass('active')
  })

  it('highlights ALL when initial status is ALL', () => {
    render(
      <FilterMonitorInside
        onClose={mockOnClose}
        onApply={mockOnApply}
        initialStatus="ALL"
      />
    )

    const allOption = screen.getByText('Todos').closest('div')
    expect(allOption).toHaveClass('active')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import StatusUptimes from './StatusUptimes'
import { Status } from '@/infraestructure/interfaces'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}))

const submitDeleteMock = vi.fn()

vi.mock('@/presentation/hooks/useUpdateMonitor.hook', () => ({
  __esModule: true,
  default: () => ({
    submitDelete: submitDeleteMock,
  }),
}))

vi.mock('@/presentation/components/shared/Toasts/Toast', () => ({
  default: ({ message }: any) => (
    <div data-testid="toast">{message}</div>
  ),
}))

const mockData = {
  data: [
    {
      id: '1',
      name: 'Server One',
      url: 'https://server-one.com',
      status: Status.UP,
      isActive: true,
    },
    {
      id: '2',
      name: 'Server Two',
      url: 'https://server-two.com',
      status: Status.DOWN,
      isActive: false,
    },
  ],
}

describe('StatusUptimes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table header', () => {
    render(<StatusUptimes data={mockData as any} />)

    expect(screen.getByText('Nombre/URL')).toBeInTheDocument()
    expect(screen.getByText('Actividad actual')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Acciones')).toBeInTheDocument()
  })

  it('renders servers correctly', () => {
    render(<StatusUptimes data={mockData as any} />)

    expect(screen.getByText('Server One')).toBeInTheDocument()
    expect(screen.getByText('https://server-one.com')).toBeInTheDocument()

    expect(screen.getByText('Server Two')).toBeInTheDocument()
    expect(screen.getByText('https://server-two.com')).toBeInTheDocument()
  })

  it('opens and closes menu', () => {
    render(<StatusUptimes data={mockData as any} />)

    const buttons = screen.getAllByLabelText('Más opciones')

    fireEvent.click(buttons[0])

    expect(screen.getByText('Editar monitor')).toBeInTheDocument()
    expect(screen.getByText('Eliminar monitor')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(
      screen.queryByText('Editar monitor')
    ).not.toBeInTheDocument()
  })

  it('redirects to edit when clicking Editar monitor', () => {
    render(<StatusUptimes data={mockData as any} />)

    fireEvent.click(screen.getAllByLabelText('Más opciones')[0])
    fireEvent.click(screen.getByText('Editar monitor'))

    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/home/monitors/1/edit'
    )
  })

  it('calls delete and shows success toast', async () => {
    submitDeleteMock.mockImplementation(({ onSuccess }: any) => {
      onSuccess()
    })

    render(<StatusUptimes data={mockData as any} />)

    fireEvent.click(screen.getAllByLabelText('Más opciones')[0])
    fireEvent.click(screen.getByText('Eliminar monitor'))

    expect(submitDeleteMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' })
    )

    await waitFor(() => {
      expect(screen.getByTestId('toast')).toHaveTextContent(
        'Monitor eliminado correctamente'
      )
    })
  })

  it('shows error toast when delete fails', async () => {
    submitDeleteMock.mockImplementation(({ onError }: any) => {
      onError()
    })

    render(<StatusUptimes data={mockData as any} />)

    fireEvent.click(screen.getAllByLabelText('Más opciones')[0])
    fireEvent.click(screen.getByText('Eliminar monitor'))

    await waitFor(() => {
      expect(screen.getByTestId('toast')).toHaveTextContent(
        'Error al eliminar el monitor'
      )
    })
  })
})

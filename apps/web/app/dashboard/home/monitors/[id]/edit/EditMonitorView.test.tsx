import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Mock } from 'vitest'

import EditMonitorPage from './page'
import useUpdateMonitor from '@/presentation/hooks/useUpdateMonitor.hook'
import { INTERVAL_OPTIONS } from '@/infraestructure/constants'

/* =========================
   Mocks
========================= */

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: '123' })),
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/presentation/hooks/useUpdateMonitor.hook', () => ({
  default: vi.fn(),
}))

vi.mock('@/infraestructure/constants', async () => {
  const actual = await vi.importActual<any>('@/infraestructure/constants')
  return {
    ...actual,
    IconHttp: () => <div />,
    IconChevron: () => <div />,
    IconLock: () => <div />,
  }
})

vi.mock('react-icons/io', () => ({
  IoIosArrowBack: () => <div />,
}))

vi.mock('@/presentation/components/shared/Toasts/Toast', () => ({
  default: () => null,
}))

vi.mock('./MonitorsEdit.scss', () => ({}))

const mockUseUpdateMonitor = useUpdateMonitor as unknown as Mock

/* =========================
   Tests
========================= */

describe('EditMonitorPage', () => {
  let queryClient: QueryClient

  const baseMock = {
    url: 'https://test.com',
    name: 'Test Monitor',
    setName: vi.fn(),
    intervalIndex: 1,
    setIntervalIndex: vi.fn(),
    currentFrequency: 60,
    notify: {
      email: true,
      sms: false,
      voice: false,
      push: false,
    },
    setNotify: vi.fn(),
    uptimeById: {
      data: {
        id: '123',
        name: 'Test Monitor',
        url: 'https://test.com',
      },
      isLoading: false,
      isError: false,
    },
    updateUptime: { isPending: false },
    submitUpdate: vi.fn(),
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    mockUseUpdateMonitor.mockReturnValue(baseMock)
  })

  it('renderiza el formulario', () => {
    const { container } = render(<EditMonitorPage />, { wrapper })
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('actualiza el nombre', () => {
    render(<EditMonitorPage />, { wrapper })

    const input = screen.getByDisplayValue('Test Monitor')
    fireEvent.change(input, { target: { value: 'Nuevo nombre' } })

    expect(baseMock.setName).toHaveBeenCalledWith('Nuevo nombre')
  })

  it('renderiza todos los intervalos', () => {
    render(<EditMonitorPage />, { wrapper })

    INTERVAL_OPTIONS.forEach(option => {
      const items = screen.getAllByText(option.label)
      expect(items.length).toBeGreaterThan(0)
    })
  })

  it('resalta el intervalo activo', () => {
    render(<EditMonitorPage />, { wrapper })

    const activeTick = document.querySelector('.active-tick')
    expect(activeTick).toHaveTextContent(
      INTERVAL_OPTIONS[baseMock.intervalIndex].label
    )
  })

  it('togglea notificación email', () => {
    render(<EditMonitorPage />, { wrapper })

    fireEvent.click(screen.getByText('E-mail'))

    expect(baseMock.setNotify).toHaveBeenCalledWith(expect.any(Function))
  })

  it('envía el formulario', () => {
    render(<EditMonitorPage />, { wrapper })

    fireEvent.submit(
      screen.getByRole('button', { name: /actualizar monitor/i })
    )

    expect(baseMock.submitUpdate).toHaveBeenCalled()
  })

  it('actualiza el intervalo con el slider', () => {
    render(<EditMonitorPage />, { wrapper })

    const slider = document.querySelector(
      'input[type="range"]'
    ) as HTMLInputElement

    fireEvent.change(slider, { target: { value: '3' } })

    expect(baseMock.setIntervalIndex).toHaveBeenCalledWith(3)
  })
})

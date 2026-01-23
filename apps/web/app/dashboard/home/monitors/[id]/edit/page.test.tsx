import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

import EditMonitorPage from './page'
import useUpdateMonitor from '@/presentation/hooks/useUpdateMonitor.hook'
import { INTERVAL_OPTIONS } from '@/infraestructure/constants'

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: '123' })),
}))

vi.mock('@/presentation/hooks/useUpdateMonitor.hook', () => ({
  default: vi.fn(),
}))

vi.mock('@/infraestructure/constants', async () => {
  const actual = await vi.importActual('@/infraestructure/constants')
  return {
    ...actual,
    IconHttp: () => <div data-testid="icon-http" />,
    IconChevron: () => <div data-testid="icon-chevron" />,
    IconLock: () => <div data-testid="icon-lock" />,
  }
})

vi.mock('react-icons/io', () => ({
  IoIosArrowBack: () => <div data-testid="arrow-back-icon" />,
}))

vi.mock('@/presentation/components/shared/Toasts/Toast', () => ({
  default: ({ visible, message, type }: any) =>
    visible ? <div data-testid={`toast-${type}`}>{message}</div> : null,
}))

vi.mock('./MonitorsEdit.scss', () => ({}))

const mockUseUpdateMonitor = useUpdateMonitor as unknown as ReturnType<typeof vi.fn>

describe('EditMonitorPage', () => {
  let queryClient: QueryClient

  const baseMock = {
    url: 'https://test.com',
    name: 'Test Monitor',
    setName: vi.fn(),
    intervalIndex: 1,
    setIntervalIndex: vi.fn(),
    currentFrequency: 60,
    notify: { email: true, sms: false, voice: false, push: false },
    setNotify: vi.fn(),
    uptimeById: {
      data: { id: '123', name: 'Test Monitor', url: 'https://test.com' },
      isLoading: false,
      isError: false,
    },
    updateUptime: { isPending: false },
    submitUpdate: vi.fn(),
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.useFakeTimers()
    mockUseUpdateMonitor.mockReturnValue(baseMock as any)
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renderiza el formulario', () => {
    const { container } = render(<EditMonitorPage />, { wrapper })
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('actualiza el nombre', () => {
  render(<EditMonitorPage />, { wrapper })

  const input = screen.getByDisplayValue('Test Monitor')
  fireEvent.change(input, { target: { value: 'Nuevo nombre' } })

  expect(baseMock.setName).toHaveBeenCalled()
})

  it('renderiza todos los intervalos', () => {
    render(<EditMonitorPage />, { wrapper })
    INTERVAL_OPTIONS.forEach(opt => {
      expect(screen.getAllByText(opt.label).length).toBeGreaterThan(0)
    })
  })

  it('resalta el intervalo activo', () => {
    render(<EditMonitorPage />, { wrapper })
    const ticks = screen.getAllByText(INTERVAL_OPTIONS[1].label)
    const active = ticks.find(el => el.classList.contains('active-tick'))
    expect(active).toBeDefined()
  })

  it('togglea notificación email', () => {
  render(<EditMonitorPage />, { wrapper })

  const email = screen.getByText('E-mail')
  fireEvent.click(email)

  expect(baseMock.setNotify).toHaveBeenCalled()
})

  it('envía el formulario', async () => {
    const submit = vi.fn()
    mockUseUpdateMonitor.mockReturnValue({
      ...baseMock,
      submitUpdate: submit,
    } as any)

    const { container } = render(<EditMonitorPage />, { wrapper })
    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)
    expect(submit).toHaveBeenCalled()
  })

  it('actualiza el intervalo con el slider', () => {
    render(<EditMonitorPage />, { wrapper })
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '3' } })
    expect(baseMock.setIntervalIndex).toHaveBeenCalled()
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import MonitorDetailsHeader from './MonitorDetailsHeader'
import useUptime from '@/presentation/hooks/useUptime.hook'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: any) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/presentation/hooks/useUptime.hook', () => ({
  default: vi.fn(),
}))

vi.mock('@/presentation/components/shared/Toasts/Toast', () => ({
  default: ({ visible, message }: any) =>
    visible ? <div>{message}</div> : null,
}))

vi.mock('react-icons/fa', () => ({
  FaCircle: () => <div data-testid="status-icon" />,
  FaExternalLinkAlt: ({ onClick }: any) => (
    <button onClick={onClick}>open-link</button>
  ),
}))

vi.mock('react-icons/io', () => ({
  IoIosCreate: () => <span />,
  IoIosTrash: () => <span />,
}))

vi.mock('./MonitorDetailsHeader.scss', () => ({}))

const mockUseUptime = useUptime as unknown as ReturnType<typeof vi.fn>

const baseMonitor = {
  monitor: {
    id: '1',
    url: 'https://test.com',
    isActive: true,
    logs: [],
  },
  stats: {
    last24Hours: {},
    last7Days: {},
    last30Days: {},
    last365Days: {},
  },
}

describe('MonitorDetailsHeader', () => {
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()

    mockUseUptime.mockReturnValue({
      deleteUptime: {
        mutate: mutateMock,
      },
    })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders monitor information correctly', () => {
    render(
      <MonitorDetailsHeader
        monitor={baseMonitor as any}
        handleOpenUrl={vi.fn()}
      />
    )

    expect(
      screen.getAllByText('https://test.com').length
    ).toBeGreaterThan(0)

    expect(screen.getByText('HTTP/S')).toBeInTheDocument()
    expect(screen.getByText('Editar')).toBeInTheDocument()
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('calls handleOpenUrl when clicking external link', () => {
    const handleOpenUrl = vi.fn()

    render(
      <MonitorDetailsHeader
        monitor={baseMonitor as any}
        handleOpenUrl={handleOpenUrl}
      />
    )

    fireEvent.click(screen.getByText('open-link'))

    expect(handleOpenUrl).toHaveBeenCalled()
  })

  it('navigates to edit page via link', () => {
    render(
      <MonitorDetailsHeader
        monitor={baseMonitor as any}
        handleOpenUrl={vi.fn()}
      />
    )

    const link = screen.getByText('Editar').closest('a')

    expect(link).toHaveAttribute(
      'href',
      '/dashboard/home/monitors/1/edit'
    )
  })

  it('calls deleteUptime.mutate when delete is clicked', () => {
    render(
      <MonitorDetailsHeader
        monitor={baseMonitor as any}
        handleOpenUrl={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Eliminar'))

    expect(mutateMock).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    )
  })

  it('shows success toast and redirects after successful delete', () => {
    render(
      <MonitorDetailsHeader
        monitor={baseMonitor as any}
        handleOpenUrl={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Eliminar'))

    const { onSuccess } = mutateMock.mock.calls[0][1]

    act(() => {
      onSuccess()
    })

    expect(
      screen.getByText('Monitor eliminado correctamente')
    ).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(pushMock).toHaveBeenCalledWith('/dashboard/home')
  })

  it('shows error toast when delete fails', () => {
    render(
      <MonitorDetailsHeader
        monitor={baseMonitor as any}
        handleOpenUrl={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Eliminar'))

    const { onError } = mutateMock.mock.calls[0][1]

    act(() => {
      onError()
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(
      screen.getByText('Error eliminando el monitor')
    ).toBeInTheDocument()
  })

  it('does nothing if monitor id is missing', () => {
    render(
      <MonitorDetailsHeader
        monitor={{ ...baseMonitor, monitor: null } as any}
        handleOpenUrl={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Eliminar'))

    expect(mutateMock).not.toHaveBeenCalled()
  })
})

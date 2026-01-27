import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

import SettingsDashboard from './page'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSettingsSections } from '@/infraestructure/constants/settingsSections.constants'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/infraestructure/constants/settingsSections.constants', () => ({
  getSettingsSections: vi.fn(),
}))

vi.mock('react-icons/fi', () => ({
  FiLogOut: () => <span />,
  FiUser: () => <span />,
  FiMail: () => <span />,
  FiBell: () => <span />,
  FiMoon: () => <span />,
  FiShield: () => <span />,
}))

vi.mock('./settings.scss', () => ({}))

const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>
const mockGetSettingsSections = getSettingsSections as unknown as ReturnType<typeof vi.fn>

const settingsMock = [
  {
    id: 'profile',
    title: 'Información de perfil',
    icon: () => <span />,
    items: [
      {
        label: 'Usuario',
        value: 'test@example.com',
        icon: () => <span />,
      },
      {
        label: 'Email',
        value: 'test@example.com',
        icon: () => <span />,
      },
    ],
  },
]

describe('SettingsDashboard', () => {
  const logoutMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseAuth.mockReturnValue({
      logout: logoutMock,
      isLoading: false,
      user: {
        signInDetails: {
          loginId: 'test@example.com',
        },
      },
    })

    mockGetSettingsSections.mockReturnValue(settingsMock)
  })

  it('renders settings header correctly', () => {
    render(<SettingsDashboard />)

    expect(screen.getByText('Configuración')).toBeInTheDocument()
    expect(
      screen.getByText('Gestiona tu cuenta y preferencias')
    ).toBeInTheDocument()
  })

  it('renders settings sections and items', () => {
    render(<SettingsDashboard />)

    expect(screen.getByText('Información de perfil')).toBeInTheDocument()
    expect(screen.getByText('Usuario')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0)
  })

  it('calls getSettingsSections with user email', () => {
    render(<SettingsDashboard />)

    expect(mockGetSettingsSections).toHaveBeenCalledWith('test@example.com')
  })

  it('renders logout section', () => {
  render(<SettingsDashboard />)

  expect(
    screen.getByRole('heading', { name: 'Cerrar sesión' })
  ).toBeInTheDocument()

  expect(
    screen.getByText(/al cerrar sesión/i)
  ).toBeInTheDocument()
})


  it('calls logout and redirects on logout click', async () => {
    logoutMock.mockResolvedValueOnce(undefined)

    render(<SettingsDashboard />)

    const button = screen.getByRole('button', { name: /cerrar sesión/i })

    await act(async () => {
      fireEvent.click(button)
    })

    expect(logoutMock).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/auth/login')
  })

  it('disables logout button while loading', () => {
    mockUseAuth.mockReturnValue({
      logout: logoutMock,
      isLoading: true,
      user: {
        signInDetails: {
          loginId: 'test@example.com',
        },
      },
    })

    render(<SettingsDashboard />)

    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    expect(screen.getByText('Cerrando sesión...')).toBeInTheDocument()
  })

  it('handles missing user email gracefully', () => {
    mockUseAuth.mockReturnValue({
      logout: logoutMock,
      isLoading: false,
      user: null,
    })

    mockGetSettingsSections.mockReturnValue(settingsMock)

    render(<SettingsDashboard />)

    expect(mockGetSettingsSections).toHaveBeenCalledWith('')
  })
})

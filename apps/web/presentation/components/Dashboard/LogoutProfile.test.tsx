import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LogoutProfile from './LogoutProfile'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

const mockPush = vi.fn()

describe('LogoutProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/dashboard',
      query: {},
      asPath: '',
      reload: vi.fn()
    } as any)
  })

  vi.mocked(useAuth).mockReturnValue({
  user: {
    signInDetails: {
      loginId: 'test-user-123'
    }
  },
  isLoading: false,
  logout: vi.fn()
} as any)

  it('displays logout button with correct text when not loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { userId: 'test-user' },
      isLoading: false,
      logout: vi.fn()
    } as any)

    render(<LogoutProfile />)

    const button = screen.getByRole('button', { name: 'Cerrar sesión' })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('disables button and shows loading text during logout', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { userId: 'test-user' },
      isLoading: true,
      logout: vi.fn()
    } as any)

    render(<LogoutProfile />)

    const button = screen.getByRole('button', { name: 'Cerrando sesión...' })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('calls logout and redirects on button click', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined)

    vi.mocked(useAuth).mockReturnValue({
      user: { userId: 'test-user' },
      isLoading: false,
      logout: mockLogout
    } as any)

    render(<LogoutProfile />)

    const button = screen.getByRole('button', { name: 'Cerrar sesión' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('handles null user gracefully', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      logout: vi.fn()
    } as any)

    render(<LogoutProfile />)

    expect(screen.queryByText(/null/i)).not.toBeInTheDocument()
    const button = screen.getByRole('button', { name: 'Cerrar sesión' })
    expect(button).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { userId: 'test-user' },
      isLoading: false,
      logout: vi.fn()
    } as any)

    const { container } = render(<LogoutProfile />)

    expect(container.querySelector('.button-logout-profile-user')).toBeInTheDocument()
    expect(container.querySelector('.profile-user')).toBeInTheDocument()
    expect(container.querySelector('.logout-button')).toBeInTheDocument()
  })
})

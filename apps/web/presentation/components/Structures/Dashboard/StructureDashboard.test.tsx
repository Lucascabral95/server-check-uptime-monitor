import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import StructureDashboard from './StructureDashboard'

vi.mock('../../auth/AuthLogo', () => ({
  AuthLogo: () => <div data-testid="auth-logo">Logo</div>
}))

vi.mock('../../Dashboard/Categories', () => ({
  default: () => <div data-testid="categories">Categories</div>
}))

vi.mock('../../Dashboard/LogoutProfile', () => ({
  default: () => <div data-testid="logout-profile">Logout</div>
}))

describe('StructureDashboard', () => {
  it('renders dashboard structure with children', () => {
    render(
      <StructureDashboard>
        <div data-testid="test-content">Test Content</div>
      </StructureDashboard>
    )

    expect(screen.getByTestId('auth-logo')).toBeInTheDocument()
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const { container } = render(
      <StructureDashboard>
        <div>Content</div>
      </StructureDashboard>
    )

    expect(container.querySelector('.dashboard')).toBeInTheDocument()
    expect(container.querySelector('.dashboard-section')).toBeInTheDocument()
    expect(container.querySelector('.dashboard-content')).toBeInTheDocument()
  })

  it('renders nested layout structure correctly', () => {
    const { container } = render(
      <StructureDashboard>
        <div>Child Content</div>
      </StructureDashboard>
    )

    const logoCategories = container.querySelector('.logo-categories-dashboard')
    expect(logoCategories).toBeInTheDocument()
  })

  it('uses semantic HTML elements', () => {
    const { container } = render(
      <StructureDashboard>
        <div>Content</div>
      </StructureDashboard>
    )

    expect(container.querySelector('aside[aria-label="Barra lateral de navegación"]')).toBeInTheDocument()
    expect(container.querySelector('nav[aria-label="Navegación principal"]')).toBeInTheDocument()
    expect(container.querySelector('main[role="main"]')).toBeInTheDocument()
  })
})

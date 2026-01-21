import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoriesDashboard from './Categories'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn()
}))

import { usePathname } from 'next/navigation'

describe('CategoriesDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation categories', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/home')

    render(<CategoriesDashboard />)

    expect(screen.getByText('Monitoreo')).toBeInTheDocument()
    expect(screen.getByText('Incidentes')).toBeInTheDocument()
    expect(screen.getByText('Estado de servidores')).toBeInTheDocument()
    expect(screen.getByText('Configuración')).toBeInTheDocument()
  })

  it('applies active class to current route', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/home')

    const { container } = render(<CategoriesDashboard />)

    const activeLink = container.querySelector('.container-categories-li-active')
    expect(activeLink).toBeInTheDocument()
    expect(activeLink?.textContent).toContain('Monitoreo')
  })

  it('applies inactive class to other routes', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/incidents')

    const { container } = render(<CategoriesDashboard />)

    const inactiveLinks = container.querySelectorAll('.container-categories-li')
    expect(inactiveLinks.length).toBeGreaterThan(0)
  })

  it('renders correct number of navigation links', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/home')

    const { container } = render(<CategoriesDashboard />)

    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(4)
  })

  it('highlights correct category for incidents route', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/incidents')

    const { container } = render(<CategoriesDashboard />)

    const activeLink = container.querySelector('.container-categories-li-active')
    expect(activeLink?.textContent).toContain('Incidentes')
  })

  it('highlights correct category for servers route', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/servers')

    const { container } = render(<CategoriesDashboard />)

    const activeLink = container.querySelector('.container-categories-li-active')
    expect(activeLink?.textContent).toContain('Estado de servidores')
  })

  it('highlights correct category for settings route', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/settings')

    const { container } = render(<CategoriesDashboard />)

    const activeLink = container.querySelector('.container-categories-li-active')
    expect(activeLink?.textContent).toContain('Configuración')
  })

  it('links have correct href attributes', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/home')

    const { container } = render(<CategoriesDashboard />)

    const links = container.querySelectorAll('a')
    const hrefs = Array.from(links).map(link => link.getAttribute('href'))

    expect(hrefs).toContain('/dashboard/home')
    expect(hrefs).toContain('/dashboard/incidents')
    expect(hrefs).toContain('/dashboard/servers')
    expect(hrefs).toContain('/dashboard/settings')
  })

  it('handles unknown route gracefully', () => {
    vi.mocked(usePathname).mockReturnValue('/unknown/route')

    const { container } = render(<CategoriesDashboard />)

    const activeLink = container.querySelector('.container-categories-li-active')
    expect(activeLink).not.toBeInTheDocument()
  })
})

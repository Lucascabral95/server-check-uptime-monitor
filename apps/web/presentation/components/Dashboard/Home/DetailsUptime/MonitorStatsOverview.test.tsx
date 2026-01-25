import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MonitorStatsOverview from './MonitorStatsOverview'

vi.mock('@/presentation/utils', () => ({
  formatInterval: vi.fn(() => '5 minutos'),
}))

vi.mock('./MonitorStatsOverview.scss', () => ({}))

const baseMonitor = {
  monitor: {
    id: '1',
    url: 'https://test.com',
    status: 'UP',
    frequency: 300,
    lastCheck: new Date('2024-01-01T10:00:00Z'),
    logs: [],
  },
  stats: {
    last24Hours: {
      healthPercentage: 99,
      incidentCount: 1,
      totalChecks: 100,
      downtimeMs: 60000,
      downtimeFormatted: '1m',
      uptimeMs: 0,
      uptimeFormatted: '0m',
    },
    last7Days: {
      healthPercentage: 97,
      incidentCount: 3,
      totalChecks: 700,
      downtimeMs: 180000,
      downtimeFormatted: '3m',
      uptimeMs: 0,
      uptimeFormatted: '0m',
    },
    last30Days: {
      healthPercentage: 95,
      incidentCount: 5,
      totalChecks: 3000,
      downtimeMs: 300000,
      downtimeFormatted: '5m',
      uptimeMs: 0,
      uptimeFormatted: '0m',
    },
    last365Days: {
      healthPercentage: 92,
      incidentCount: 10,
      totalChecks: 36000,
      downtimeMs: 600000,
      downtimeFormatted: '10m',
      uptimeMs: 0,
      uptimeFormatted: '0m',
    },
  },
}

const stats24hMock = [
  true,
  true,
  false,
  true,
  false,
]

describe('MonitorStatsOverview', () => {
  it('renders current status correctly', () => {
    render(
      <MonitorStatsOverview
        monitor={baseMonitor as any}
        stats24h={stats24hMock}
      />
    )

    expect(screen.getByText('Estado actual')).toBeInTheDocument()
    expect(screen.getByText('UP')).toBeInTheDocument()
    expect(screen.getByText('Actualmente UP')).toBeInTheDocument()
  })

  it('renders last check and interval', () => {
  render(
    <MonitorStatsOverview
      monitor={baseMonitor as any}
      stats24h={stats24hMock}
    />
  )

  expect(screen.getByText('Ultimo chequeo')).toBeInTheDocument()

  expect(
    screen.getByText(/Chequeado cada 5 minutos/i)
  ).toBeInTheDocument()
})


  it('renders uptime bars correctly', () => {
    const { container } = render(
      <MonitorStatsOverview
        monitor={baseMonitor as any}
        stats24h={stats24hMock}
      />
    )

    const bars = container.querySelectorAll('.uptime-bars .bar')
    expect(bars.length).toBe(stats24hMock.length)

    expect(container.querySelectorAll('.bar.up').length).toBe(3)
    expect(container.querySelectorAll('.bar.down').length).toBe(2)
  })

  it('renders stats for all periods', () => {
    render(
      <MonitorStatsOverview
        monitor={baseMonitor as any}
        stats24h={stats24hMock}
      />
    )

    expect(screen.getByText('Ultimos 7 dias')).toBeInTheDocument()
    expect(screen.getByText('97%')).toBeInTheDocument()

    expect(screen.getByText('Ultimos 30 dias')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()

    expect(screen.getByText('Ultimos 365 dias')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
  })
})

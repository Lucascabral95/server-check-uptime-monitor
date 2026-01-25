import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LatestIncidents from './LatestIncidents'

/* =========================
   Mocks
========================= */

vi.mock('./LatestIncidents.scss', () => ({}))

/* =========================
   Fixtures
========================= */

const logsMock = [
  {
    id: '1',
    monitorId: 'm1',
    statusCode: 500,
    durationMs: 1200,
    error: 'Internal Server Error',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    success: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    monitorId: 'm1',
    statusCode: 502,
    durationMs: 800,
    error: 'Bad Gateway',
    timestamp: new Date('2024-01-01T11:00:00Z'),
    success: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    monitorId: 'm1',
    statusCode: 504,
    durationMs: 1500,
    error: undefined,
    timestamp: new Date('2024-01-01T12:00:00Z'),
    success: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

/* =========================
   Tests
========================= */

describe('LatestIncidents', () => {
  it('renders table headers correctly', () => {
    render(
      <LatestIncidents
        errorLogs={logsMock}
        countLimitIncidents={2}
        handleMoreIncidents={vi.fn()}
      />
    )

    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Causa raíz')).toBeInTheDocument()
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Duración')).toBeInTheDocument()
  })

  it('renders only the limited number of incidents', () => {
    render(
      <LatestIncidents
        errorLogs={logsMock}
        countLimitIncidents={2}
        handleMoreIncidents={vi.fn()}
      />
    )

    // Solo 2 filas de incidentes
    expect(screen.getAllByText('Error').length).toBe(2)
    expect(screen.queryByText('504')).not.toBeInTheDocument()
  })

  it('renders incident data correctly', () => {
    render(
      <LatestIncidents
        errorLogs={[logsMock[0]]}
        countLimitIncidents={5}
        handleMoreIncidents={vi.fn()}
      />
    )

    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('Internal Server Error')).toBeInTheDocument()
    expect(screen.getByText('1200 ms')).toBeInTheDocument()
  })

  it('renders fallback text when error message is missing', () => {
    render(
      <LatestIncidents
        errorLogs={[logsMock[2]]}
        countLimitIncidents={5}
        handleMoreIncidents={vi.fn()}
      />
    )

    expect(screen.getByText('Error desconocido')).toBeInTheDocument()
  })

  it('shows empty state when there are no incidents', () => {
    render(
      <LatestIncidents
        errorLogs={[]}
        countLimitIncidents={5}
        handleMoreIncidents={vi.fn()}
      />
    )

    expect(
      screen.getByText('No hay incidentes registrados')
    ).toBeInTheDocument()
  })

  it('shows "load more" button when there are more incidents than the limit', () => {
    render(
      <LatestIncidents
        errorLogs={logsMock}
        countLimitIncidents={1}
        handleMoreIncidents={vi.fn()}
      />
    )

    expect(
      screen.getByText('Cargar más incidentes')
    ).toBeInTheDocument()
  })

  it('calls handleMoreIncidents when clicking load more', () => {
    const handleMore = vi.fn()

    render(
      <LatestIncidents
        errorLogs={logsMock}
        countLimitIncidents={1}
        handleMoreIncidents={handleMore}
      />
    )

    fireEvent.click(screen.getByText('Cargar más incidentes'))

    expect(handleMore).toHaveBeenCalled()
  })
})

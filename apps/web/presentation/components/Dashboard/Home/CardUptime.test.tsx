import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardUptime from './CardUptime';
import { GetUptimeDto, Status } from '@/infraestructure/interfaces';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mutateMock = vi.fn();

vi.mock('@/presentation/hooks/useUptime.hook', () => ({
  default: () => ({
    deleteUptime: {
      mutate: mutateMock,
    },
  }),
}));

vi.mock('@/presentation/hooks', () => ({
  useUptimeCheck: () => ({
    timeUntilNextCheck: 60000,
  }),
}));

vi.mock('@/presentation/utils', () => ({
  formatDate: () => '2024-01-15',
  formatLastCheck: () => 'Hace 1 minuto',
  formatTimeRemaining: () => '1m',
  getStatusColor: () => 'green',
}));

const mockUptime: GetUptimeDto = {
  id: '1',
  userId: 'user1',
  name: 'Test Monitor',
  url: 'https://example.com',
  frequency: 60,
  isActive: true,
  nextCheck: new Date(),
  lastCheck: new Date(),
  status: Status.UP,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('CardUptime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders monitor data correctly', () => {
    render(<CardUptime uptimes={mockUptime} />);

    expect(screen.getByText('Test Monitor')).toBeInTheDocument();
    expect(screen.getByText('HTTP')).toBeInTheDocument();
    expect(screen.getByText('60s')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(<CardUptime uptimes={mockUptime} />);

    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('toggles menu when more button is clicked', () => {
    render(<CardUptime uptimes={mockUptime} />);

    const moreButton = screen.getByRole('button', {
      name: /más opciones/i,
    });

    expect(screen.queryByText('Editar monitor')).not.toBeInTheDocument();

    fireEvent.click(moreButton);

    expect(screen.getByText('Editar monitor')).toBeInTheDocument();
    expect(screen.getByText('Eliminar monitor')).toBeInTheDocument();
  });

  it('closes menu when clicking outside', async () => {
    render(<CardUptime uptimes={mockUptime} />);

    const moreButton = screen.getByRole('button', {
      name: /más opciones/i,
    });

    fireEvent.click(moreButton);
    expect(screen.getByText('Editar monitor')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(
        screen.queryByText('Editar monitor')
      ).not.toBeInTheDocument();
    });
  });

  it('renders frequency correctly', () => {
    const customUptime = { ...mockUptime, frequency: 30 };
    render(<CardUptime uptimes={customUptime} />);

    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('renders with null lastCheck safely', () => {
    const uptimeWithoutLastCheck = {
      ...mockUptime,
      lastCheck: null as unknown as Date,
    };

    render(<CardUptime uptimes={uptimeWithoutLastCheck} />);

    expect(screen.getByText('Test Monitor')).toBeInTheDocument();
  });

  it('handles rapid menu toggle clicks', () => {
    render(<CardUptime uptimes={mockUptime} />);

    const moreButton = screen.getByRole('button', {
      name: /más opciones/i,
    });

    fireEvent.click(moreButton);
    fireEvent.click(moreButton);
    fireEvent.click(moreButton);

    expect(screen.getByText('Editar monitor')).toBeInTheDocument();
  });
});

import '@testing-library/jest-dom';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import DashboardHome from './page';
import useUptime from '@/presentation/hooks/useUptime.hook';

vi.mock('@/presentation/hooks/useUptime.hook');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/presentation/components/Filters', () => ({
  FiltersMonitor: ({ monitorCount }: any) => (
    <div data-testid="filters">Total: {monitorCount}</div>
  ),
}));

vi.mock('@/presentation/components/Dashboard/Home/CardUptime', () => ({
  default: () => <div data-testid="card-uptime" />,
}));

vi.mock('@/presentation/components/Dashboard/Home/ChartStats', () => ({
  default: () => <div data-testid="chart-stats" />,
}));

vi.mock('@/presentation/components/Dashboard/Home/ChartStatsLastDay', () => ({
  default: () => <div data-testid="chart-stats-last-day" />,
}));

vi.mock('@/presentation/components/shared/states/LoadingState', () => ({
  default: ({ message }: any) => <div>{message}</div>,
}));

vi.mock('@/presentation/components/shared/states/ErrorState', () => ({
  default: ({ onRetry }: any) => (
    <button onClick={onRetry}>retry</button>
  ),
}));

const baseStats = {
  upLast24h: [],
  downLast24h: [],
  totalMonitors: 1,
  upMonitors: 1,
  downMonitors: 0,
};

describe('DashboardHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render LoadingState when uptimes is loading', () => {
    vi.mocked(useUptime).mockReturnValue({
      uptimes: { isLoading: true },
      myStats: { isLoading: false },
    } as any);

    render(<DashboardHome />);

    expect(screen.getByText('Cargando monitoreos...')).toBeInTheDocument();
  });

  it('should render LoadingState when myStats is loading', () => {
    vi.mocked(useUptime).mockReturnValue({
      uptimes: { isLoading: false },
      myStats: { isLoading: true },
    } as any);

    render(<DashboardHome />);

    expect(screen.getByText('Cargando monitoreos...')).toBeInTheDocument();
  });

  it('should render ErrorState when uptimes has error', () => {
    const refetch = vi.fn();

    vi.mocked(useUptime).mockReturnValue({
      uptimes: { isError: true, refetch },
      myStats: { isError: false },
    } as any);

    render(<DashboardHome />);

    fireEvent.click(screen.getByText('retry'));
    expect(refetch).toHaveBeenCalled();
  });

  it('should render dashboard title', () => {
    vi.mocked(useUptime).mockReturnValue({
      uptimes: {
        isLoading: false,
        isError: false,
        data: { data: [], pagination: { totalItems: 0 } },
      },
      myStats: {
        isLoading: false,
        isError: false,
        data: baseStats,
      },
    } as any);

    render(<DashboardHome />);

    expect(
      screen.getByText('Monitoreo de servidores')
    ).toBeInTheDocument();
  });

  it('should render FiltersMonitor with correct monitor count', () => {
    vi.mocked(useUptime).mockReturnValue({
      uptimes: {
        isLoading: false,
        isError: false,
        data: { data: [], pagination: { totalItems: 3 } },
      },
      myStats: {
        isLoading: false,
        isError: false,
        data: baseStats,
      },
    } as any);

    render(<DashboardHome />);

    expect(screen.getByText('Total: 3')).toBeInTheDocument();
  });

  it('should render ChartStats components', () => {
    vi.mocked(useUptime).mockReturnValue({
      uptimes: {
        isLoading: false,
        isError: false,
        data: { data: [], pagination: { totalItems: 0 } },
      },
      myStats: {
        isLoading: false,
        isError: false,
        data: baseStats,
      },
    } as any);

    render(<DashboardHome />);

    expect(screen.getByTestId('chart-stats')).toBeInTheDocument();
    expect(screen.getByTestId('chart-stats-last-day')).toBeInTheDocument();
  });

  it('should render CardUptime for each uptime', () => {
    vi.mocked(useUptime).mockReturnValue({
      uptimes: {
        isLoading: false,
        isError: false,
        data: {
          data: [{ id: '1' }, { id: '2' }],
          pagination: { totalItems: 2 },
        },
      },
      myStats: {
        isLoading: false,
        isError: false,
        data: baseStats,
      },
    } as any);

    render(<DashboardHome />);

    expect(screen.getAllByTestId('card-uptime')).toHaveLength(2);
  });

  it('should render "Nuevo servidor" button', () => {
    vi.mocked(useUptime).mockReturnValue({
      uptimes: {
        isLoading: false,
        isError: false,
        data: { data: [], pagination: { totalItems: 0 } },
      },
      myStats: {
        isLoading: false,
        isError: false,
        data: baseStats,
      },
    } as any);

    render(<DashboardHome />);

    expect(
      screen.getByText('Nuevo servidor')
    ).toBeInTheDocument();
  });

  it('should render empty state when no uptimes', () => {
    vi.mocked(useUptime).mockReturnValue({
      uptimes: {
        isLoading: false,
        isError: false,
        data: { data: [], pagination: { totalItems: 0 } },
      },
      myStats: {
        isLoading: false,
        isError: false,
        data: baseStats,
      },
    } as any);

    render(<DashboardHome />);

    expect(screen.queryAllByTestId('card-uptime')).toHaveLength(0);
  });
});

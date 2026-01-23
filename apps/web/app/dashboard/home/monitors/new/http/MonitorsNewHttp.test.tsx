import '@testing-library/jest-dom';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import MonitorsNewHttp from './page';
import useUptime from '../../../../../../presentation/hooks/useUptime.hook';
import useNewMonitor from '../../../../../../presentation/hooks/useNewMonitor.hook';

vi.mock('../../../../../../presentation/hooks/useUptime.hook');
vi.mock('../../../../../../presentation/hooks/useNewMonitor.hook');

const cleanupMock = vi.fn();

const baseUseNewMonitorMock = {
  url: 'https://test.com',
  setUrl: vi.fn(),
  intervalIndex: 1,
  setIntervalIndex: vi.fn(),
  progressPercent: 16.67,
  currentFrequency: 300,
  notify: { email: true, sms: false, voice: false, push: false },
  setNotify: vi.fn(),
  name: 'Test Monitor',
  setName: vi.fn(),
  cleanup: cleanupMock,
};

describe('MonitorsNewHttp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNewMonitor).mockReturnValue(baseUseNewMonitorMock as any);
  });

  it('should call createUptime.mutate with valid form data on submit', () => {
    const mutateMock = vi.fn();

    vi.mocked(useUptime).mockReturnValue({
      createUptime: { mutate: mutateMock },
    } as any);

    render(<MonitorsNewHttp />);

    fireEvent.submit(document.querySelector('form')!);

    expect(mutateMock).toHaveBeenCalledWith(
      {
        name: 'Test Monitor',
        url: 'https://test.com',
        frequency: 300,
      },
      expect.any(Object)
    );
  });

  it('should show success toast on successful creation', async () => {
    const mutateMock = vi.fn((_data, options) => {
      options.onSuccess();
    });

    vi.mocked(useUptime).mockReturnValue({
      createUptime: { mutate: mutateMock },
    } as any);

    render(<MonitorsNewHttp />);

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(
        screen.getByText('Monitor agregado exitosamente')
      ).toBeInTheDocument();
    });
  });

  it('should call cleanup after successful creation', async () => {
    const mutateMock = vi.fn((_data, options) => {
      options.onSuccess();
    });

    vi.mocked(useUptime).mockReturnValue({
      createUptime: { mutate: mutateMock },
    } as any);

    render(<MonitorsNewHttp />);

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(cleanupMock).toHaveBeenCalledTimes(1);
    });
  });
});

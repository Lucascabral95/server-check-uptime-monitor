import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUptimeCheck } from './useUptimeCheck.hook'

describe('useUptimeCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 when lastCheck is null', () => {
    const { result } = renderHook(() =>
      useUptimeCheck({ lastCheck: null, frequency: 60 })
    )

    expect(result.current.timeUntilNextCheck).toBe(0)
  })

  it('calculates remaining time correctly with Date', () => {
    const lastCheck = new Date('2024-01-01T09:59:00Z')

    const { result } = renderHook(() =>
      useUptimeCheck({ lastCheck, frequency: 120 })
    )

    expect(result.current.timeUntilNextCheck).toBe(60)
  })

  it('calculates remaining time correctly with string date', () => {
    const lastCheck = '2024-01-01T09:58:30Z'

    const { result } = renderHook(() =>
      useUptimeCheck({ lastCheck, frequency: 120 })
    )

    expect(result.current.timeUntilNextCheck).toBe(30)
  })

  it('returns 0 if next check time already passed', () => {
    const lastCheck = new Date('2024-01-01T09:55:00Z')

    const { result } = renderHook(() =>
      useUptimeCheck({ lastCheck, frequency: 60 })
    )

    expect(result.current.timeUntilNextCheck).toBe(0)
  })

  it('recalculates when frequency changes', () => {
    const lastCheck = new Date('2024-01-01T09:59:00Z')

    const { result, rerender } = renderHook(
      ({ frequency }) => useUptimeCheck({ lastCheck, frequency }),
      { initialProps: { frequency: 120 } }
    )

    expect(result.current.timeUntilNextCheck).toBe(60)

    rerender({ frequency: 180 })

    expect(result.current.timeUntilNextCheck).toBe(120)
  })
})

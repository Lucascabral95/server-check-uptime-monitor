import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useNewMonitor from './useNewMonitor.hook'
import { INTERVAL_OPTIONS } from '@/infraestructure/constants'

describe('useNewMonitor hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useNewMonitor())

      expect(result.current.url).toBe('https://')
      expect(result.current.name).toBe('')
      expect(result.current.intervalIndex).toBe(1)
    })

    it('should initialize with default notify state - email enabled, others disabled', () => {
      const { result } = renderHook(() => useNewMonitor())

      expect(result.current.notify.email).toBe(true)
      expect(result.current.notify.sms).toBe(false)
      expect(result.current.notify.voice).toBe(false)
      expect(result.current.notify.push).toBe(false)
    })

    it('should calculate progress percent correctly for default interval', () => {
      const { result } = renderHook(() => useNewMonitor())

      expect(result.current.progressPercent).toBe(
        (1 / (INTERVAL_OPTIONS.length - 1)) * 100
      )
    })

    it('should calculate current frequency correctly for default interval', () => {
      const { result } = renderHook(() => useNewMonitor())

      expect(result.current.currentFrequency).toBe(INTERVAL_OPTIONS[1].seconds)
    })
  })

  describe('URL State', () => {
    it('should set url correctly', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setUrl('https://example.com')
      })

      expect(result.current.url).toBe('https://example.com')
    })

    it('should allow setting url to empty string', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setUrl('')
      })

      expect(result.current.url).toBe('')
    })

    it('should allow setting url with http protocol', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setUrl('http://test.com')
      })

      expect(result.current.url).toBe('http://test.com')
    })
  })

  describe('Name State', () => {
    it('should set name correctly', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setName('My Monitor')
      })

      expect(result.current.name).toBe('My Monitor')
    })

    it('should allow setting name to empty string', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setName('')
      })

      expect(result.current.name).toBe('')
    })

    it('should allow setting name with special characters', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setName('Monitor-Test_123')
      })

      expect(result.current.name).toBe('Monitor-Test_123')
    })
  })

  describe('Interval State', () => {
    it('should set interval index correctly', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setIntervalIndex(0)
      })

      expect(result.current.intervalIndex).toBe(0)
    })

    it('should set interval index to last option', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setIntervalIndex(INTERVAL_OPTIONS.length - 1)
      })

      expect(result.current.intervalIndex).toBe(INTERVAL_OPTIONS.length - 1)
    })

    it('should calculate progress percent correctly for different intervals', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setIntervalIndex(0)
      })
      expect(result.current.progressPercent).toBe(0)

      act(() => {
        result.current.setIntervalIndex(INTERVAL_OPTIONS.length - 1)
      })
      expect(result.current.progressPercent).toBe(100)
    })

    it('should update current frequency when interval changes', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setIntervalIndex(0)
      })
      expect(result.current.currentFrequency).toBe(INTERVAL_OPTIONS[0].seconds)

      act(() => {
        result.current.setIntervalIndex(2)
      })
      expect(result.current.currentFrequency).toBe(INTERVAL_OPTIONS[2].seconds)
    })
  })

  describe('Notify State', () => {
    it('should set notify state correctly', () => {
      const { result } = renderHook(() => useNewMonitor())

      const newNotifyState = {
        email: false,
        sms: true,
        voice: true,
        push: false,
      }

      act(() => {
        result.current.setNotify(newNotifyState)
      })

      expect(result.current.notify).toEqual(newNotifyState)
    })

    it('should allow toggling individual notify options', () => {
      const { result } = renderHook(() => useNewMonitor())

      act(() => {
        result.current.setNotify({ ...result.current.notify, email: false })
      })

      expect(result.current.notify.email).toBe(false)

      act(() => {
        result.current.setNotify({ ...result.current.notify, sms: true })
      })

      expect(result.current.notify.sms).toBe(true)
    })

    it('should allow setting all notify options to true', () => {
      const { result } = renderHook(() => useNewMonitor())

      const allEnabled = {
        email: true,
        sms: true,
        voice: true,
        push: true,
      }

      act(() => {
        result.current.setNotify(allEnabled)
      })

      expect(result.current.notify).toEqual(allEnabled)
    })
  })

  describe('Cleanup Function', () => {
    it('should reset all states to default values', () => {
      const { result } = renderHook(() => useNewMonitor())

      // Change all states
      act(() => {
        result.current.setUrl('https://modified.com')
        result.current.setName('Modified Name')
        result.current.setIntervalIndex(3)
      })

      expect(result.current.url).toBe('https://modified.com')
      expect(result.current.name).toBe('Modified Name')
      expect(result.current.intervalIndex).toBe(3)

      // Call cleanup
      act(() => {
        result.current.cleanup()
      })

      expect(result.current.url).toBe('https://')
      expect(result.current.name).toBe('')
      expect(result.current.intervalIndex).toBe(1)
    })

    it('should not reset notify state on cleanup', () => {
      const { result } = renderHook(() => useNewMonitor())

      const modifiedNotify = {
        email: false,
        sms: true,
        voice: true,
        push: true,
      }

      act(() => {
        result.current.setNotify(modifiedNotify)
      })

      act(() => {
        result.current.cleanup()
      })

      expect(result.current.notify).toEqual(modifiedNotify)
    })
  })

  describe('Memoized Values', () => {
    it('should recalculate progress percent when interval index changes', () => {
      const { result } = renderHook(() => useNewMonitor())

      const initialProgress = result.current.progressPercent

      act(() => {
        result.current.setIntervalIndex(2)
      })

      const updatedProgress = result.current.progressPercent

      expect(initialProgress).not.toBe(updatedProgress)
    })

    it('should recalculate current frequency when interval index changes', () => {
      const { result } = renderHook(() => useNewMonitor())

      const initialFrequency = result.current.currentFrequency

      act(() => {
        result.current.setIntervalIndex(3)
      })

      const updatedFrequency = result.current.currentFrequency

      expect(initialFrequency).not.toBe(updatedFrequency)
    })
  })

  describe('Return Values', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useNewMonitor())

      expect(result.current).toHaveProperty('url')
      expect(result.current).toHaveProperty('setUrl')
      expect(result.current).toHaveProperty('name')
      expect(result.current).toHaveProperty('setName')
      expect(result.current).toHaveProperty('cleanup')
      expect(result.current).toHaveProperty('intervalIndex')
      expect(result.current).toHaveProperty('setIntervalIndex')
      expect(result.current).toHaveProperty('progressPercent')
      expect(result.current).toHaveProperty('currentFrequency')
      expect(result.current).toHaveProperty('notify')
      expect(result.current).toHaveProperty('setNotify')
    })

    it('should return functions that are callable', () => {
      const { result } = renderHook(() => useNewMonitor())

      expect(typeof result.current.setUrl).toBe('function')
      expect(typeof result.current.setName).toBe('function')
      expect(typeof result.current.setIntervalIndex).toBe('function')
      expect(typeof result.current.setNotify).toBe('function')
      expect(typeof result.current.cleanup).toBe('function')
    })
  })
})

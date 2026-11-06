import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalytic, useProductAnalytic, useProductAnalyticPrompt } from '../useAnalytic'

// Mock constants
vi.mock('@/constants/localStorage', () => ({
  localStorageKey: {
    productAnalyticPrompt: 'productAnalyticPrompt',
    productAnalytic: 'productAnalytic',
  },
}))

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  createJSONStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}))

describe('useAnalytic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset stores to initial state
    useProductAnalyticPrompt.setState({
      productAnalyticPrompt: false,
      setProductAnalyticPrompt: useProductAnalyticPrompt.getState().setProductAnalyticPrompt,
    })
    useProductAnalytic.setState({
      productAnalytic: false,
      setProductAnalytic: useProductAnalytic.getState().setProductAnalytic,
    })
  })

  describe('useProductAnalyticPrompt', () => {
    it('should initialize with analytics prompt disabled', () => {
      const { result } = renderHook(() => useProductAnalyticPrompt())
      
      expect(result.current.productAnalyticPrompt).toBe(false)
    })

    it('cannot enable the analytics prompt', async () => {
      const { result } = renderHook(() => useProductAnalyticPrompt())
      
      await act(async () => {
        result.current.setProductAnalyticPrompt(true)
      })
      
      expect(result.current.productAnalyticPrompt).toBe(false)
    })

    it('should call setProductAnalyticPrompt function', async () => {
      const { result } = renderHook(() => useProductAnalyticPrompt())
      
      await act(async () => {
        result.current.setProductAnalyticPrompt(true)
      })
      
      expect(result.current.productAnalyticPrompt).toBe(false)
    })

    it('should persist productAnalyticPrompt value to localStorage', async () => {
      const { result } = renderHook(() => useProductAnalyticPrompt())
      
      await act(async () => {
        result.current.setProductAnalyticPrompt(true)
      })
      
      expect(result.current.productAnalyticPrompt).toBe(false)
    })
  })

  describe('useProductAnalytic', () => {
    it('should initialize with default value false', () => {
      const { result } = renderHook(() => useProductAnalytic())
      
      expect(result.current.productAnalytic).toBe(false)
    })

    it('cannot enable product analytics', async () => {
      const { result } = renderHook(() => useProductAnalytic())
      
      await act(async () => {
        result.current.setProductAnalytic(true)
      })
      
      expect(result.current.productAnalytic).toBe(false)
    })

    it('should call setProductAnalytic function', async () => {
      const { result } = renderHook(() => useProductAnalytic())
      
      await act(async () => {
        result.current.setProductAnalytic(true)
      })
      
      expect(result.current.productAnalytic).toBe(false)
    })

    it('should persist productAnalytic value to localStorage', async () => {
      const { result } = renderHook(() => useProductAnalytic())
      
      await act(async () => {
        result.current.setProductAnalytic(true)
      })
      
      expect(result.current.productAnalytic).toBe(false)
    })
  })

  describe('useAnalytic', () => {
    it('should return all analytic values and setters', () => {
      const { result } = renderHook(() => useAnalytic())
      
      expect(result.current).toHaveProperty('productAnalyticPrompt')
      expect(result.current).toHaveProperty('setProductAnalyticPrompt')
      expect(result.current).toHaveProperty('productAnalytic')
      expect(result.current).toHaveProperty('setProductAnalytic')
      expect(result.current).toHaveProperty('updateAnalytic')
    })

    it('should update both analytic values using updateAnalytic', async () => {
      const { result } = renderHook(() => useAnalytic())
      
      await act(async () => {
        result.current.updateAnalytic({
          productAnalyticPrompt: true,
          productAnalytic: true
        })
      })
      
      expect(result.current.productAnalyticPrompt).toBe(false)
      expect(result.current.productAnalytic).toBe(false)
    })

    it('should return default values on initial render', () => {
      const { result } = renderHook(() => useAnalytic())
      
      expect(result.current.productAnalyticPrompt).toBe(false)
      expect(result.current.productAnalytic).toBe(false)
    })
  })
})

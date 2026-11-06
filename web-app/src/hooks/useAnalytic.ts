import { localStorageKey } from '@/constants/localStorage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { backendStorage } from '@/lib/backendStorage'

export const useAnalytic = () => {
  const { setProductAnalyticPrompt: persistPromptOff } =
    useProductAnalyticPrompt()
  const { setProductAnalytic: persistAnalyticsOff } = useProductAnalytic()

  const setProductAnalyticPrompt = (_value: boolean) => persistPromptOff(false)
  const setProductAnalytic = (_value: boolean) => persistAnalyticsOff(false)

  const updateAnalytic = (_values: {
    productAnalyticPrompt: boolean
    productAnalytic: boolean
  }) => {
    setProductAnalyticPrompt(false)
    setProductAnalytic(false)
  }

  return {
    productAnalyticPrompt: false,
    setProductAnalyticPrompt,
    productAnalytic: false,
    setProductAnalytic,
    updateAnalytic,
  }
}

export type ProductAnalyticPromptState = {
  productAnalyticPrompt: boolean
  setProductAnalyticPrompt: (value: boolean) => void
}

export const useProductAnalyticPrompt = create<ProductAnalyticPromptState>()(
  persist(
    (set) => {
      const initialState = {
        productAnalyticPrompt: false,
        setProductAnalyticPrompt: async (_value: boolean) => {
          set(() => ({ productAnalyticPrompt: false }))
        },
      }

      return initialState
    },
    {
      name: localStorageKey.productAnalyticPrompt,
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      merge: (_persistedState, currentState) => ({
        ...currentState,
        productAnalyticPrompt: false,
      }),
    }
  )
)

export type ProductAnalyticState = {
  productAnalytic: boolean
  setProductAnalytic: (value: boolean) => void
}

export const useProductAnalytic = create<ProductAnalyticState>()(
  persist(
    (set) => {
      const initialState = {
        productAnalytic: false,
        setProductAnalytic: async (_value: boolean) => {
          set(() => ({ productAnalytic: false }))
        },
      }

      return initialState
    },
    {
      name: localStorageKey.productAnalytic,
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      merge: (_persistedState, currentState) => ({
        ...currentState,
        productAnalytic: false,
      }),
    }
  )
)

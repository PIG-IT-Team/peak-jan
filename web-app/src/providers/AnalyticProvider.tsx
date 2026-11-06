import posthog from 'posthog-js'
import { useEffect } from 'react'

export function AnalyticProvider() {
  useEffect(() => {
    posthog.opt_out_capturing()
  }, [])

  return null
}

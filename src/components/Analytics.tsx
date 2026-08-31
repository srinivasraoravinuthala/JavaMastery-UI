import { useEffect } from 'react'

/**
 * Optional Cloudflare Web Analytics.
 * Set VITE_CF_ANALYTICS_TOKEN in .env.production (token from Cloudflare dashboard).
 */
export function Analytics() {
  useEffect(() => {
    const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN
    if (!token) return

    const existing = document.querySelector('script[data-cf-beacon]')
    if (existing) return

    const script = document.createElement('script')
    script.defer = true
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
    script.setAttribute('data-cf-beacon', JSON.stringify({ token }))
    document.head.appendChild(script)
  }, [])

  return null
}

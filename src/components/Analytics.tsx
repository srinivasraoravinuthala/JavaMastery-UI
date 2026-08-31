import { useEffect } from 'react'

/** Optional Cloudflare Web Analytics — set VITE_CF_ANALYTICS_TOKEN in production. */
export function Analytics() {
  useEffect(() => {
    const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN
    if (!token) return

    const script = document.createElement('script')
    script.defer = true
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
    script.setAttribute('data-cf-beacon', JSON.stringify({ token }))
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  return null
}

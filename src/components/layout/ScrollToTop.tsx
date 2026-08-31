import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset window scroll on route changes so new pages don't open mid-page. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

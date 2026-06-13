import { useState, useEffect, useCallback } from 'react'
import { getSearchService } from '@/services/searchService'
import type { SearchResult } from '@/types'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const service = getSearchService()
        const found = await service.search(query)
        setResults(found)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const openSearch = useCallback(() => setOpen(true), [])
  const closeSearch = useCallback(() => {
    setOpen(false)
    setQuery('')
    setResults([])
  }, [])

  return { query, setQuery, results, loading, open, openSearch, closeSearch, setOpen }
}

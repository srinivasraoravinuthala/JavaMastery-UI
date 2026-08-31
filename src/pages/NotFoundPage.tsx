import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DocNotFound } from '@/components/doc/DocNotFound'
import { useSearchContext } from '@/contexts/SearchContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getSearchService } from '@/services/searchService'
import { suggestSlugs } from '@/utils/slugSuggestions'

export function NotFoundPage() {
  const location = useLocation()
  const { openSearch } = useSearchContext()
  const [suggestions, setSuggestions] = useState<string[]>([])

  usePageMeta({ title: 'Page Not Found' })

  useEffect(() => {
    const match = location.pathname.match(/^\/docs\/(.+)$/)
    if (!match) return

    const attempted = match[1]
    getSearchService()
      .getAllSlugs()
      .then((slugs) => setSuggestions(suggestSlugs(attempted, slugs)))
      .catch(() => setSuggestions([]))
  }, [location.pathname])

  const docMatch = location.pathname.match(/^\/docs\/(.+)$/)

  if (docMatch) {
    return (
      <DocNotFound
        slug={docMatch[1]}
        suggestions={suggestions}
        onSearchOpen={openSearch}
      />
    )
  }

  return (
    <DocNotFound onSearchOpen={openSearch} />
  )
}

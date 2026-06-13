import { createContext, useContext, type ReactNode } from 'react'
import { useSearch } from '@/hooks/useSearch'
import type { SearchResult } from '@/types'

interface SearchContextValue {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  loading: boolean
  open: boolean
  openSearch: () => void
  closeSearch: () => void
  setOpen: (open: boolean) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const search = useSearch()
  return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>
}

export function useSearchContext() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearchContext must be used within SearchProvider')
  return ctx
}

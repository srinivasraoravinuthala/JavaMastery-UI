import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SearchDialog } from '@/components/search/SearchDialog'
import { ReadingProgress } from '@/components/layout/ReadingProgress'
import { BackToTop } from '@/components/doc/BackToTop'
import { useContentTree } from '@/hooks/useContent'
import { SearchProvider, useSearchContext } from '@/contexts/SearchContext'
import { Analytics } from '@/components/Analytics'

function LayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { tree, loading } = useContentTree()
  const { query, setQuery, results, loading: searchLoading, open, openSearch, closeSearch } = useSearchContext()

  useKeyboardShortcut('k', openSearch, { ctrl: true })

  return (
    <div className="min-h-screen flex flex-col">
      <Analytics />
      <ReadingProgress />
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onSearchOpen={openSearch}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1">
        {!loading && <Sidebar tree={tree} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <SearchDialog
        open={open}
        onClose={closeSearch}
        query={query}
        onQueryChange={setQuery}
        results={results}
        loading={searchLoading}
      />

      <BackToTop />
    </div>
  )
}

export function MainLayout() {
  return (
    <SearchProvider>
      <LayoutContent />
    </SearchProvider>
  )
}

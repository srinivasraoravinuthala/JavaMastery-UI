import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { BookmarksPage } from '@/pages/BookmarksPage'
import { ExamplesPage } from '@/pages/ExamplesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Loader2 } from 'lucide-react'

const DocPage = lazy(() => import('@/pages/DocPage').then((m) => ({ default: m.DocPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="docs/:slug"
            element={
              <Suspense fallback={<PageLoader />}>
                <DocPage />
              </Suspense>
            }
          />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="examples" element={<ExamplesPage />} />
          <Route path="examples/:package" element={<ExamplesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

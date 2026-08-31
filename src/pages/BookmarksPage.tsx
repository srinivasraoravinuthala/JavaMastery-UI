import { Link } from 'react-router-dom'
import { Bookmark, Trash2, ArrowRight, Download, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useBookmarks, useFavorites } from '@/hooks/useBookmarks'
import { exportLearnerData, importLearnerData } from '@/hooks/useLearnerData'

function docLink(slug: string, questionId?: string) {
  return questionId ? `/docs/${slug}#${questionId}` : `/docs/${slug}`
}

export function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks()
  const { favorites, removeFavorite } = useFavorites()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = exportLearnerData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `javamastery-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        importLearnerData(data)
        window.location.reload()
      } catch {
        alert('Invalid progress file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bookmarks & Favorites</h1>
          <p className="text-muted-foreground">Your saved pages and favorite interview questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
            }}
          />
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Bookmarks ({bookmarks.length})
        </h2>

        {bookmarks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No bookmarks yet. Save pages while reading.</p>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((b) => {
              const key = b.questionId || b.path
              const href = docLink(b.slug, b.questionId)
              return (
                <Card key={key}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <Link to={href} className="font-medium hover:text-primary transition-colors line-clamp-2">
                        {b.title}
                      </Link>
                      <div className="flex gap-1 mt-1">
                        {b.section && <Badge variant="outline" className="text-xs">{b.section}</Badge>}
                        {b.type === 'question' && <Badge variant="java" className="text-xs">question</Badge>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeBookmark(key)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={href}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Favorites ({favorites.length})</h2>
        {favorites.length === 0 ? (
          <p className="text-muted-foreground text-sm">Star interview questions to save them here.</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((f) => {
              const key = f.questionId || f.path
              const href = docLink(f.slug, f.questionId)
              return (
                <Card key={key}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <Link to={href} className="font-medium hover:text-primary transition-colors line-clamp-2">
                        {f.title}
                      </Link>
                      <Badge variant="java" className="text-xs mt-1">{f.type}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFavorite(key)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={href}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

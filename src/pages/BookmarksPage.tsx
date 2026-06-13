import { Link } from 'react-router-dom'
import { Bookmark, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useBookmarks, useFavorites } from '@/hooks/useBookmarks'

export function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks()
  const { favorites, removeFavorite } = useFavorites()

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Bookmarks & Favorites</h1>
      <p className="text-muted-foreground mb-8">Your saved pages and favorite interview questions</p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Bookmarks ({bookmarks.length})
        </h2>

        {bookmarks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No bookmarks yet. Save pages while reading.</p>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((b) => (
              <Card key={b.path}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link to={`/docs/${b.slug}`} className="font-medium hover:text-primary transition-colors truncate block">
                      {b.title}
                    </Link>
                    {b.section && <Badge variant="outline" className="text-xs mt-1">{b.section}</Badge>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeBookmark(b.path)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/docs/${b.slug}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Favorites ({favorites.length})</h2>
        {favorites.length === 0 ? (
          <p className="text-muted-foreground text-sm">Star interview questions to save them here.</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((f) => (
              <Card key={f.questionId || f.path}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link to={`/docs/${f.slug}`} className="font-medium hover:text-primary transition-colors truncate block">
                      {f.title}
                    </Link>
                    <Badge variant="java" className="text-xs mt-1">{f.type}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFavorite(f.questionId || f.path)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

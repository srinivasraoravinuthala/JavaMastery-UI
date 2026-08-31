import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocNotFoundProps {
  slug?: string
  error?: string | null
  suggestions?: string[]
  onSearchOpen?: () => void
}

export function DocNotFound({ slug, error, suggestions = [], onSearchOpen }: DocNotFoundProps) {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg mx-auto">
      <p className="text-6xl font-bold text-primary/20 mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
      <p className="text-muted-foreground mb-2">
        {error || 'The requested page could not be loaded.'}
      </p>
      {slug && (
        <p className="text-xs text-muted-foreground font-mono mb-6 break-all">
          /docs/{slug}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="mb-8 text-left rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium mb-2">Did you mean:</p>
          <ul className="space-y-1">
            {suggestions.map((s) => (
              <li key={s}>
                <Link
                  to={`/docs/${s}`}
                  className="text-sm text-primary hover:underline font-mono"
                >
                  /docs/{s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        {onSearchOpen && (
          <Button variant="outline" onClick={onSearchOpen}>
            <Search className="h-4 w-4" />
            Search Docs
          </Button>
        )}
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/docs/02-learn--01-GettingStarted">Start Learning</Link>
        </Button>
      </div>
    </div>
  )
}

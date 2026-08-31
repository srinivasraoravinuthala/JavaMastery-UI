import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOPIC_SECTIONS } from '@/config/site'

interface DocNotFoundProps {
  slug?: string
  suggestions?: string[]
}

export function DocNotFound({ slug, suggestions = [] }: DocNotFoundProps) {
  if (slug) {
    console.warn(`[JavaMastery] Doc not found: ${slug}`)
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <p className="text-6xl font-bold text-primary/20 mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
      <p className="text-muted-foreground mb-6">
        {slug
          ? `No document matches "${slug.replace(/--/g, ' / ').replace(/-/g, ' ')}".`
          : 'The requested page could not be loaded.'}
      </p>

      {suggestions.length > 0 && (
        <div className="mb-8 text-left">
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

      <div className="mb-8">
        <p className="text-sm font-medium mb-2">Browse by section</p>
        <div className="flex flex-wrap justify-center gap-2">
          {TOPIC_SECTIONS.map((section) => (
            <Button key={section.id} variant="outline" size="sm" asChild>
              <Link to={`/docs/${section.path}--00-INDEX`}>{section.title}</Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

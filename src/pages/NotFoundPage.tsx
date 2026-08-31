import { Link, useLocation } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOPIC_SECTIONS } from '@/config/site'

export function NotFoundPage() {
  const location = useLocation()
  const attempted = location.pathname.replace(/^\/docs\//, '')

  if (attempted) {
    console.warn(`[JavaMastery] Page not found: ${location.pathname}`)
  }

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8">
        {attempted
          ? `No page matches "${attempted.replace(/--/g, ' / ')}".`
          : "The page you're looking for doesn't exist or hasn't been loaded yet."}
      </p>

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

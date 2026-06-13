import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { RecentPage } from '@/types'

interface ContinueReadingProps {
  recent: RecentPage[]
}

export function ContinueReading({ recent }: ContinueReadingProps) {
  if (recent.length === 0) return null

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Continue Reading</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recent.slice(0, 3).map((page) => (
            <Link key={page.path} to={`/docs/${page.slug}`}>
              <Card className="hover:border-primary/30 transition-colors group h-full">
                <CardContent className="p-4">
                  <p className="font-medium group-hover:text-primary transition-colors mb-1 truncate">
                    {page.title}
                  </p>
                  {page.section && (
                    <p className="text-xs text-muted-foreground mb-2">{page.section}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(page.visitedAt)}
                    <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

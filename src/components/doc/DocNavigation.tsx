import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DocNode } from '@/types'

interface DocNavigationProps {
  prev: DocNode | null
  next: DocNode | null
}

export function DocNavigation({ prev, next }: DocNavigationProps) {
  if (!prev && !next) return null

  return (
    <div className="flex items-stretch gap-4 mt-12 pt-8 border-t border-border">
      {prev ? (
        <Button variant="outline" className="flex-1 h-auto py-4 justify-start" asChild>
          <Link to={`/docs/${prev.slug}`}>
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground mb-0.5">Previous</p>
                <p className="font-medium text-sm">{prev.title}</p>
              </div>
            </div>
          </Link>
        </Button>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Button variant="outline" className="flex-1 h-auto py-4 justify-end" asChild>
          <Link to={`/docs/${next.slug}`}>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-0.5">Next</p>
                <p className="font-medium text-sm">{next.title}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </div>
          </Link>
        </Button>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  )
}

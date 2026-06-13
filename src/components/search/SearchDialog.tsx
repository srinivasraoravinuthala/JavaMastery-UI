import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { SearchResult } from '@/types'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
  query: string
  onQueryChange: (q: string) => void
  results: SearchResult[]
  loading: boolean
}

export function SearchDialog({
  open,
  onClose,
  query,
  onQueryChange,
  results,
  loading,
}: SearchDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSelect = (result: SearchResult) => {
    navigate(`/docs/${result.slug}`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Search documentation</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search titles, headings, content..."
              className="pl-9 h-11 border-0 shadow-none focus-visible:ring-0 text-base"
            />
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Searching...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No results found for &ldquo;{query}&rdquo;
            </p>
          )}

          {!loading && results.length > 0 && (
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={result.slug}>
                  <button
                    onClick={() => handleSelect(result)}
                    className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium text-sm truncate">{result.title}</span>
                      {result.section && (
                        <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                          {result.section}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 pl-5">{result.excerpt}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!query && (
            <p className="text-center py-8 text-muted-foreground text-sm">
              Type to search across all documentation
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

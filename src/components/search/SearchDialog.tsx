import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, Loader2, Play } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { SearchResult } from '@/types'
import { cn } from '@/utils/cn'

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
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, results.length])

  const handleSelect = (result: SearchResult) => {
    if (result.kind === 'example') {
      navigate(`/examples${result.package ? `/${result.package}` : ''}?q=${encodeURIComponent(result.title)}`)
    } else {
      navigate(`/docs/${result.slug}`)
    }
    onClose()
  }

  const docResults = results.filter((r) => r.kind !== 'example')
  const exampleResults = results.filter((r) => r.kind === 'example')
  const flatResults = [...docResults, ...exampleResults]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!flatResults.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault()
      handleSelect(flatResults[selectedIndex])
    }
  }

  const renderResult = (result: SearchResult, index: number) => (
    <li key={`${result.kind}-${result.path}`}>
      <button
        onClick={() => handleSelect(result)}
        className={cn(
          'w-full text-left rounded-lg px-3 py-2.5 hover:bg-accent transition-colors',
          selectedIndex === index && 'bg-accent'
        )}
      >
        <div className="flex items-center gap-2 mb-0.5">
          {result.kind === 'example' ? (
            <Play className="h-3.5 w-3.5 text-primary shrink-0" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
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
  )

  let resultIndex = 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Search documentation and examples</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search docs, examples, headings..."
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
            <div className="space-y-3">
              {docResults.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Docs</p>
                  <ul className="space-y-1">
                    {docResults.map((result) => renderResult(result, resultIndex++))}
                  </ul>
                </div>
              )}
              {exampleResults.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Examples</p>
                  <ul className="space-y-1">
                    {exampleResults.map((result) => renderResult(result, resultIndex++))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!query && (
            <p className="text-center py-8 text-muted-foreground text-sm">
              Type to search docs and Java examples. Use ↑↓ and Enter to navigate.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Play, Search, Loader2 } from 'lucide-react'
import { ExampleSourceDialog } from '@/components/examples/ExampleSourceDialog'
import { Button } from '@/components/ui/button'
import { getExamplesService } from '@/services/examplesService'
import { usePageMeta } from '@/hooks/usePageMeta'
import type { ExampleIndexEntry } from '@/types/examples'
import { cn } from '@/utils/cn'

const LEVEL_ORDER = [
  'Orientation',
  'Beginner',
  'Intermediate',
  'Computer Science',
  'Senior',
  'Tech Lead',
  'Applied Java',
  'Ecosystem',
  'Other',
]

export function ExamplesPage() {
  const { package: pkgParam } = useParams<{ package?: string }>()
  const [searchParams] = useSearchParams()
  const [entries, setEntries] = useState<ExampleIndexEntry[]>([])
  const [packages, setPackages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  usePageMeta({
    title: 'Java Examples',
    description: 'Browse and run all JavaMastery example programs with full source code.',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getExamplesService()
      .getEntries()
      .then((list) => {
        if (!cancelled) setEntries(list)
      })
      .catch(() => {
        if (!cancelled) setEntries([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    getExamplesService()
      .getPackages()
      .then((pkgs) => {
        if (!cancelled) setPackages(pkgs)
      })
      .catch(() => {
        if (!cancelled) setPackages([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    let list = entries
    if (pkgParam) {
      list = list.filter((e) => e.package === pkgParam)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (e) =>
          e.className.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.package.toLowerCase().includes(q)
      )
    }
    return list
  }, [entries, pkgParam, query])

  const grouped = useMemo(() => {
    const map = new Map<string, ExampleIndexEntry[]>()
    for (const entry of filtered) {
      const level = entry.level || 'Other'
      if (!map.has(level)) map.set(level, [])
      map.get(level)!.push(entry)
    }
    return LEVEL_ORDER.filter((l) => map.has(l)).map((level) => ({
      level,
      items: map.get(level)!,
    }))
  }, [filtered])

  const openExample = (path: string) => {
    setSelectedPath(path)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Java Examples</h1>
        </div>
        <p className="text-muted-foreground">
          {entries.length} runnable programs from the JavaMastery repository. Click any example to view full source.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by class name, title, or package..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="-mx-4 mb-8 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-min pb-1">
          <PackageFilterLink active={!pkgParam} href="/examples" label="All" count={entries.length} />
          {packages.map((pkg) => (
            <PackageFilterLink
              key={pkg}
              active={pkgParam === pkg}
              href={`/examples/${pkg}`}
              label={pkg}
              count={entries.filter((e) => e.package === pkg).length}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No examples match your search.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ level, items }) => (
            <section key={level}>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">{level}</h2>
              <div className="grid gap-2">
                {items.map((entry) => (
                  <div
                    key={entry.path}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium">{entry.className}</p>
                      <p className="text-xs text-muted-foreground">{entry.package}</p>
                      {entry.title && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{entry.title}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                      {entry.learnChapter && (
                        <Link
                          to={`/docs/${entry.learnChapter}`}
                          className="text-xs text-primary hover:underline sm:mr-1"
                        >
                          Tutorial →
                        </Link>
                      )}
                      <Button
                        size="sm"
                        className="min-h-10 w-full sm:w-auto"
                        onClick={() => openExample(entry.path)}
                      >
                        View source
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ExampleSourceDialog
        repoPath={selectedPath}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

function PackageFilterLink({
  active,
  href,
  label,
  count,
}: {
  active: boolean
  href: string
  label: string
  count: number
}) {
  return (
    <Link
      to={href}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium border transition-colors whitespace-nowrap min-h-9',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-border hover:bg-muted'
      )}
    >
      {label}
      <span className={cn('opacity-70', active && 'opacity-90')}>{count}</span>
    </Link>
  )
}

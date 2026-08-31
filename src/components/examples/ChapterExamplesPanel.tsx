import { useEffect, useState } from 'react'
import { Play, Copy, Check, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ExampleSourceDialog } from './ExampleSourceDialog'
import { extractChapterExamples } from '@/utils/extractDocExamples'
import { getExamplesService } from '@/services/examplesService'
import type { ExampleContent, ExampleIndexEntry } from '@/types/examples'

interface ChapterExamplesPanelProps {
  content: string
}

export function ChapterExamplesPanel({ content }: ChapterExamplesPanelProps) {
  const [open, setOpen] = useState(true)
  const [entries, setEntries] = useState<ExampleIndexEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    extractChapterExamples(content)
      .then((paths) => Promise.all(
        paths.map((path) =>
          getExamplesService().getExample(path).catch((): ExampleContent | null => null)
        )
      ))
      .then((items) => {
        if (!cancelled) {
          const resolved: ExampleIndexEntry[] = []
          for (const ex of items) {
            if (!ex) continue
            resolved.push({
              path: ex.path,
              package: ex.package,
              className: ex.className,
              title: ex.title,
              explanation: ex.explanation,
              runCommand: ex.runCommand,
              level: ex.level,
              learnChapter: ex.learnChapter,
            })
          }
          setEntries(resolved)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [content])

  if (loading || entries.length === 0) return null

  const handleCopy = async (runCommand: string, path: string) => {
    await navigator.clipboard.writeText(runCommand)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen} className="mb-8 rounded-xl border border-border bg-card">
        <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors rounded-xl">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Play className="h-4 w-4 text-primary" />
          <span className="font-semibold">Runnable examples</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">
            {entries.length}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.path}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-border/60 bg-muted/20"
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-medium text-primary">{entry.className}</p>
                {entry.title && (
                  <p className="text-sm text-muted-foreground truncate">{entry.title}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setSelectedPath(entry.path)
                    setDialogOpen(true)
                  }}
                >
                  View source
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(entry.runCommand, entry.path)}
                >
                  {copiedPath === entry.path ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a
                    href={getExamplesService().getGitHubUrl(entry.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-1">
            Browse all examples on the{' '}
            <Link to="/examples" className="text-primary hover:underline">Examples page</Link>.
          </p>
        </CollapsibleContent>
      </Collapsible>

      <ExampleSourceDialog
        repoPath={selectedPath}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

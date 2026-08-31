import { useEffect, useState } from 'react'
import { ExternalLink, Copy, Check, Loader2, Play, Terminal, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/markdown/CodeBlock'
import { getExamplesService } from '@/services/examplesService'
import { useViewedExamples } from '@/hooks/useLearnerData'
import type { ExampleContent } from '@/types/examples'
import { SITE_CONFIG } from '@/config/site'

interface ExampleSourceDialogProps {
  repoPath: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExampleSourceDialog({ repoPath, open, onOpenChange }: ExampleSourceDialogProps) {
  const [example, setExample] = useState<ExampleContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showRunner, setShowRunner] = useState(false)
  const { markViewed } = useViewedExamples()

  useEffect(() => {
    if (!open || !repoPath) {
      setExample(null)
      setError(null)
      setShowRunner(false)
      return
    }

    setLoading(true)
    setError(null)
    getExamplesService()
      .getExample(repoPath)
      .then((ex) => {
        setExample(ex)
        markViewed(repoPath)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [open, repoPath, markViewed])

  const handleCopy = async () => {
    if (!example) return
    await navigator.clipboard.writeText(example.runCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const service = getExamplesService()
  const githubUrl = repoPath ? service.getGitHubUrl(repoPath) : ''
  const runOnlineUrl = example ? service.getOneCompilerUrl(example.source) : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">
            {example?.className || repoPath?.split('/').pop()?.replace(/\.java$/, '') || 'Example'}
          </DialogTitle>
          {example?.title && (
            <p className="text-sm text-muted-foreground">{example.title}</p>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive py-4">{error}</p>
        )}

        {example && !loading && (
          <div className="space-y-4">
            {example.explanation && (
              <p className="text-sm text-muted-foreground leading-relaxed">{example.explanation}</p>
            )}

            {example.prerequisites && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Prerequisites</p>
                <p className="text-sm">{example.prerequisites}</p>
              </div>
            )}

            {example.expectedOutput && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Expected output</p>
                <pre className="text-sm font-mono whitespace-pre-wrap">{example.expectedOutput}</pre>
              </div>
            )}

            {example.learnChapter && (
              <p className="text-sm">
                <LinkIcon className="inline h-3.5 w-3.5 mr-1" />
                Related tutorial:{' '}
                <Link to={`/docs/${example.learnChapter}`} className="text-primary hover:underline">
                  View chapter
                </Link>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{example.runCommand}</code>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy command
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowRunner(!showRunner)}>
                <Play className="h-3.5 w-3.5" />
                Run online
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </Button>
            </div>

            {showRunner && (
              <div className="space-y-2">
                <iframe
                  title="Java online compiler"
                  src={`https://onecompiler.com/embed/java?code=${encodeURIComponent(example.source.replace(/^package\s+[\w.]+;\s*/m, ''))}&theme=dark`}
                  className="w-full h-96 rounded-lg border border-border"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5" />
                  Run locally: clone{' '}
                  <a href={SITE_CONFIG.github.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {SITE_CONFIG.github.url.replace('https://github.com/', '')}
                  </a>
                  , then {example.runCommand}
                </p>
                <Button variant="link" size="sm" className="h-auto p-0" asChild>
                  <a href={runOnlineUrl} target="_blank" rel="noopener noreferrer">
                    Open in OneCompiler (full tab)
                  </a>
                </Button>
              </div>
            )}

            <CodeBlock language="java">{example.source}</CodeBlock>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

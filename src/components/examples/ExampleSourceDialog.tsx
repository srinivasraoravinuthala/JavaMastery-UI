import { useEffect, useState } from 'react'
import { ExternalLink, Copy, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/markdown/CodeBlock'
import { getExamplesService } from '@/services/examplesService'
import type { ExampleContent } from '@/types/examples'

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

  useEffect(() => {
    if (!open || !repoPath) {
      setExample(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    getExamplesService()
      .getExample(repoPath)
      .then(setExample)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [open, repoPath])

  const handleCopy = async () => {
    if (!example) return
    await navigator.clipboard.writeText(example.runCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const githubUrl = repoPath ? getExamplesService().getGitHubUrl(repoPath) : ''

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

            <div className="flex flex-wrap items-center gap-2">
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{example.runCommand}</code>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy command
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open on GitHub
                </a>
              </Button>
            </div>

            <CodeBlock language="java">{example.source}</CodeBlock>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

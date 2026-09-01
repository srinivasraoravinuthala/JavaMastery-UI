import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ExternalLink, Copy, Check, Loader2, Play, Terminal, Link as LinkIcon, Code2 } from 'lucide-react'
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
import { buildOneCompilerUrls, populateOneCompilerEmbed } from '@/utils/oneCompiler'
import { cn } from '@/utils/cn'

type ViewerTab = 'source' | 'run'

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
  const [copiedReady, setCopiedReady] = useState(false)
  const [tab, setTab] = useState<ViewerTab>('source')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { markViewed } = useViewedExamples()

  useEffect(() => {
    if (!open || !repoPath) {
      setExample(null)
      setError(null)
      setTab('source')
      return
    }

    setLoading(true)
    setError(null)
    setTab('source')
    getExamplesService()
      .getExample(repoPath)
      .then((ex) => {
        setExample(ex)
        markViewed(repoPath)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [open, repoPath, markViewed])

  const service = getExamplesService()
  const githubUrl = repoPath ? service.getGitHubUrl(repoPath) : ''
  const compiler = example ? buildOneCompilerUrls(example.source) : null

  // Re-inject when switching to Run tab or when prepared code changes
  useEffect(() => {
    if (tab !== 'run' || !compiler?.preparedCode || !iframeRef.current) return
    const iframe = iframeRef.current
    // Slight delay so OneCompiler finishes listening after load / tab switch
    const t = window.setTimeout(() => {
      populateOneCompilerEmbed(iframe, compiler.preparedCode)
    }, 400)
    return () => window.clearTimeout(t)
  }, [tab, compiler?.preparedCode])

  const handleCopyCommand = async () => {
    if (!example) return
    await navigator.clipboard.writeText(example.runCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyReadyCode = async () => {
    if (!compiler) return
    await navigator.clipboard.writeText(compiler.preparedCode)
    setCopiedReady(true)
    setTimeout(() => setCopiedReady(false), 2000)
  }

  /** Full-tab open: copy prepared Main.java first (URL code= is unreliable). */
  const handleOpenFullTab = async () => {
    if (!compiler) return
    try {
      await navigator.clipboard.writeText(compiler.preparedCode)
      setCopiedReady(true)
      setTimeout(() => setCopiedReady(false), 2500)
    } catch {
      // Clipboard may fail; still open the tab
    }
    window.open(compiler.fullTabUrl, '_blank', 'noopener,noreferrer')
  }

  const handleIframeLoad = () => {
    if (!iframeRef.current || !compiler) return
    // Retry a few times — OneCompiler needs listenToEvents ready
    const code = compiler.preparedCode
    const iframe = iframeRef.current
    populateOneCompilerEmbed(iframe, code)
    window.setTimeout(() => populateOneCompilerEmbed(iframe, code), 500)
    window.setTimeout(() => populateOneCompilerEmbed(iframe, code), 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex flex-col gap-0 overflow-hidden p-0',
          // Mobile: full-viewport sheet
          'max-sm:!inset-0 max-sm:!left-0 max-sm:!top-0 max-sm:!h-[100dvh] max-sm:!w-full',
          'max-sm:!max-w-none max-sm:!translate-x-0 max-sm:!translate-y-0 max-sm:!rounded-none',
          // Desktop: near-fullscreen panel
          'sm:max-w-6xl sm:w-[min(96vw,72rem)] sm:h-[min(92vh,900px)] sm:rounded-xl'
        )}
      >
        <div className="flex flex-col h-full min-h-0">
          <DialogHeader className="shrink-0 border-b border-border px-4 py-4 pr-12 sm:px-6 text-left">
            <DialogTitle className="font-mono text-base sm:text-lg break-all">
              {example?.className || repoPath?.split('/').pop()?.replace(/\.java$/, '') || 'Example'}
            </DialogTitle>
            {example?.title && (
              <p className="text-sm text-muted-foreground line-clamp-2">{example.title}</p>
            )}
          </DialogHeader>

          {loading && (
            <div className="flex flex-1 items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive px-4 py-6 sm:px-6">{error}</p>
          )}

          {example && !loading && (
            <>
              <div className="shrink-0 flex gap-1 px-4 pt-3 sm:px-6">
                <TabButton active={tab === 'source'} onClick={() => setTab('source')} icon={<Code2 className="h-4 w-4" />}>
                  Source
                </TabButton>
                <TabButton active={tab === 'run'} onClick={() => setTab('run')} icon={<Play className="h-4 w-4" />}>
                  Run online
                </TabButton>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6">
                {tab === 'source' ? (
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

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <code className="bg-muted px-2 py-2 rounded text-xs sm:text-sm font-mono break-all">
                        {example.runCommand}
                      </code>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="min-h-10 w-full sm:w-auto" onClick={handleCopyCommand}>
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          Copy command
                        </Button>
                        <Button variant="outline" className="min-h-10 w-full sm:w-auto" asChild>
                          <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            GitHub
                          </a>
                        </Button>
                        <Button className="min-h-10 w-full sm:w-auto" onClick={() => setTab('run')}>
                          <Play className="h-3.5 w-3.5" />
                          Run online
                        </Button>
                      </div>
                    </div>

                    <CodeBlock language="java">{example.source}</CodeBlock>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 h-full min-h-[50vh]">
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Terminal className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>
                        Run locally: clone{' '}
                        <a
                          href={SITE_CONFIG.github.url}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {SITE_CONFIG.github.url.replace('https://github.com/', '')}
                        </a>
                        , then <code className="font-mono">{example.runCommand}</code>
                      </span>
                    </p>

                    {/* Mobile: full-tab CTA (iframe is too small to use) */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      <Button className="min-h-12 w-full text-base" onClick={handleOpenFullTab}>
                        <Play className="h-4 w-4" />
                        Open in OneCompiler
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Ready-to-run code (Main class, no package) is copied to your clipboard — paste into the editor if needed.
                      </p>
                      <Button variant="outline" className="min-h-10 w-full" onClick={handleCopyReadyCode}>
                        {copiedReady ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedReady ? 'Copied ready-to-run code' : 'Copy ready-to-run code'}
                      </Button>
                      <Button variant="outline" className="min-h-10 w-full" onClick={handleCopyCommand}>
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        Copy local run command
                      </Button>
                    </div>

                    {/* Desktop: iframe embed via postMessage populateCode */}
                    <div className="hidden sm:flex flex-col flex-1 min-h-0 gap-3">
                      {compiler && !compiler.tooLargeForEmbed ? (
                        <iframe
                          ref={iframeRef}
                          id="oc-editor"
                          title="Java online compiler"
                          src={compiler.embedUrl}
                          onLoad={handleIframeLoad}
                          className="w-full flex-1 min-h-[55vh] rounded-lg border border-border bg-muted"
                        />
                      ) : (
                        <div className="flex flex-1 min-h-[40vh] items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
                          <div className="space-y-3 max-w-md">
                            <p className="text-sm text-muted-foreground">
                              This example is large for an in-page embed. Open it in a full OneCompiler tab instead
                              (ready-to-run code is copied first).
                            </p>
                            <Button onClick={handleOpenFullTab}>
                              <ExternalLink className="h-4 w-4" />
                              Open in OneCompiler
                            </Button>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 items-center">
                        <Button variant="link" className="h-auto p-0" onClick={handleOpenFullTab}>
                          Open in OneCompiler (full tab)
                        </Button>
                        <Button variant="outline" size="sm" className="min-h-9" onClick={handleCopyReadyCode}>
                          {copiedReady ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedReady ? 'Copied' : 'Copy ready-to-run code'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium min-h-10 transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {icon}
      {children}
    </button>
  )
}

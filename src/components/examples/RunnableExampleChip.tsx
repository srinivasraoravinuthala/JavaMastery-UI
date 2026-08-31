import { useState, useEffect } from 'react'
import { Play, Copy, Check } from 'lucide-react'
import { ExampleSourceDialog } from './ExampleSourceDialog'
import {
  isExampleReference,
  normalizeExamplePath,
  exampleLabel,
  parseRunCommand,
  toRunCommand,
} from '@/utils/examplePath'
import { getExamplesService } from '@/services/examplesService'

interface RunnableExampleChipProps {
  refText: string
}

export function RunnableExampleChip({ refText }: RunnableExampleChipProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [repoPath, setRepoPath] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getExamplesService()
      .getIndex()
      .then(() => {
        const classIndex = getExamplesService().getClassIndex()
        const path = normalizeExamplePath(refText, classIndex)
        setRepoPath(path)
      })
  }, [refText])

  const label = repoPath
    ? exampleLabel(repoPath)
    : parseRunCommand(refText)?.split('/').pop() || refText.replace(/^java\s+/, '')

  const runCommand = repoPath ? toRunCommand(repoPath) : refText.startsWith('java ') ? refText : `java ${refText}`

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(runCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isExampleReference(refText) && !refText.startsWith('java ')) {
    return <code className="text-sm font-mono">{refText}</code>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => repoPath && setDialogOpen(true)}
        disabled={!repoPath}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-sm font-mono text-primary hover:bg-primary/10 transition-colors not-prose align-middle disabled:opacity-50"
        title={repoPath ? 'View source code' : 'Example not found in index'}
      >
        <Play className="h-3 w-3 shrink-0 fill-current" />
        <span>{label}</span>
        <span
          role="button"
          tabIndex={0}
          onClick={handleCopy}
          onKeyDown={(e) => e.key === 'Enter' && handleCopy(e as unknown as React.MouseEvent)}
          className="ml-0.5 p-0.5 rounded hover:bg-primary/20"
          title="Copy run command"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 opacity-60" />}
        </span>
      </button>

      {repoPath && (
        <ExampleSourceDialog
          repoPath={repoPath}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  )
}

/** Re-export for backward compatibility with inline code detection */
export function isRunCommand(text: string): boolean {
  return isExampleReference(text)
}

/** @deprecated Use RunnableExampleChip */
export function InlineRunCommand({ command }: { command: string }) {
  return <RunnableExampleChip refText={command} />
}

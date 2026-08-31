import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InlineRunCommandProps {
  command: string
}

export function InlineRunCommand({ command }: InlineRunCommandProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span className="inline-flex items-center gap-1 not-prose align-middle">
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
        {command}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={handleCopy}
        aria-label="Copy run command"
        title="Copy run command"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </span>
  )
}

const RUN_COMMAND_RE = new RegExp(
  '^java\\s+pkg[\\w/.-]+\\.java$|^java\\s+pkg[\\w/]+(?:/[\\w.-]+\\.java)?$'
)

export function isRunCommand(text: string): boolean {
  return RUN_COMMAND_RE.test(text.trim())
}

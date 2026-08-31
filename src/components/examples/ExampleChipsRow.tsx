import { RunnableExampleChip } from './RunnableExampleChip'
import { splitExampleLine } from '@/utils/examplePath'

interface ExampleChipsRowProps {
  refs: string
}

export function ExampleChipsRow({ refs }: ExampleChipsRowProps) {
  const parts = refs.split('|').map((s) => s.trim()).filter(Boolean)

  return (
    <div className="example-chips-row flex flex-wrap items-center gap-2 py-3 px-4 my-4 rounded-lg border border-border bg-muted/30 not-prose">
      <span className="text-sm font-medium text-muted-foreground shrink-0">▶ Run:</span>
      {parts.map((part, i) => (
        <span key={`${part}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">·</span>}
          <RunnableExampleChip refText={part} />
        </span>
      ))}
    </div>
  )
}

export function parseExampleChipsLine(line: string): string | null {
  if (!line.includes('▶')) return null
  const refs = splitExampleLine(line)
  if (refs.length === 0) return null
  return refs.join('|')
}

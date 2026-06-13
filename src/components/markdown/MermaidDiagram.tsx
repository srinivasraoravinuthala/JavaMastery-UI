import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from '@/hooks/useTheme'

interface MermaidDiagramProps {
  chart: string
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    })

    const render = async () => {
      if (!ref.current) return
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`
        const { svg } = await mermaid.render(id, chart)
        ref.current.innerHTML = svg
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to render diagram')
      }
    }

    render()
  }, [chart, resolvedTheme])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Mermaid error: {error}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto rounded-lg border border-border bg-card p-4"
    />
  )
}

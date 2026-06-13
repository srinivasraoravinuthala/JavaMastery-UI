import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

type CalloutType = 'info' | 'warning' | 'tip' | 'danger'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  danger: AlertCircle,
}

const styles: Record<CalloutType, string> = {
  info: 'callout-info',
  warning: 'callout-warning',
  tip: 'callout-tip',
  danger: 'callout-danger',
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const Icon = icons[type]

  return (
    <div className={cn('callout', styles[type])}>
      <div className="flex gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5 opacity-70" />
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold mb-1 text-foreground">{title}</p>}
          <div className="text-sm text-muted-foreground [&>p]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function parseCalloutType(className?: string): CalloutType {
  if (!className) return 'info'
  if (className.includes('warning') || className.includes('caution')) return 'warning'
  if (className.includes('tip') || className.includes('hint')) return 'tip'
  if (className.includes('danger') || className.includes('error')) return 'danger'
  return 'info'
}

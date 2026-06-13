import { useReadingProgress } from '@/hooks/useReadingProgress'
import { cn } from '@/utils/cn'

export function ReadingProgress() {
  const progress = useReadingProgress()

  return (
    <div
      className={cn('reading-progress')}
      style={{ transform: `scaleX(${progress / 100})` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  )
}

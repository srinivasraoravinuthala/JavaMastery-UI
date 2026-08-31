import { parseChapterTitle } from '@/utils/slugify'

interface DocTitleProps {
  title: string
  showChapter?: boolean
}

export function DocTitle({ title, showChapter = false }: DocTitleProps) {
  const { chapter, heading } = parseChapterTitle(title)

  if (!showChapter || chapter == null) {
    return <>{title}</>
  }

  return (
    <span className="flex flex-col gap-1">
      <span className="text-sm font-semibold uppercase tracking-widest text-primary">
        Chapter {chapter}
      </span>
      <span>{heading}</span>
    </span>
  )
}

export function docTitleForMeta(title: string, showChapter = false): string {
  const { chapter, heading } = parseChapterTitle(title)
  if (showChapter && chapter != null) {
    return heading
  }
  return title
}

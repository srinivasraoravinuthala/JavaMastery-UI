import type { HeadingItem } from '@/types'
import { cn } from '@/utils/cn'

interface TableOfContentsProps {
  headings: HeadingItem[]
  activeId?: string
}

export function TableOfContents({ headings, activeId }: TableOfContentsProps) {
  const filtered = headings.filter((h) => h.level >= 2 && h.level <= 4)

  if (filtered.length === 0) return null

  return (
    <nav className="space-y-1" aria-label="Table of contents">
      <p className="font-semibold text-sm mb-3 text-foreground">On this page</p>
      <ul className="space-y-1 text-sm">
        {filtered.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                'block py-1 text-muted-foreground hover:text-foreground transition-colors border-l-2 border-transparent pl-3',
                heading.level === 3 && 'pl-6',
                heading.level === 4 && 'pl-9',
                activeId === heading.id && 'text-primary border-primary font-medium'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import { useEffect, useState } from 'react'
import type { HeadingItem } from '@/types'

export function useActiveHeading(headings: HeadingItem[]): string | undefined {
  const [activeId, setActiveId] = useState<string>()

  useEffect(() => {
    const ids = headings.filter((h) => h.level >= 2 && h.level <= 4).map((h) => h.id)
    if (ids.length === 0) return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  return activeId
}

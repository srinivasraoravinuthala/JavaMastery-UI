import type { HeadingItem } from '@/types'

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`#[\]]/g, '').trim()
      headings.push({
        id: text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        text,
        level,
      })
    }
  }

  return headings
}

export function extractTags(content: string, path: string): string[] {
  const tags = new Set<string>()

  const section = path.match(/docs\/(\d+-\w+)/)?.[1]
  if (section) tags.add(section.replace(/^\d+-/, ''))

  if (path.includes('interview')) tags.add('interview')
  if (path.includes('learn')) tags.add('tutorial')

  const keywords = ['java', 'jvm', 'spring', 'collections', 'concurrency', 'streams', 'oop']
  const lower = content.toLowerCase()
  for (const kw of keywords) {
    if (lower.includes(kw)) tags.add(kw)
  }

  return Array.from(tags)
}

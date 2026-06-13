export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function pathToSlug(path: string): string {
  return path
    .replace(/^docs\//, '')
    .replace(/\.md$/, '')
    .replace(/\//g, '--')
}

export function slugToPath(slug: string): string {
  const parts = slug.split('--')
  if (parts.length === 1) {
    return `docs/${parts[0]}.md`
  }
  const file = parts[parts.length - 1]
  const dirs = parts.slice(0, -1)
  return `docs/${dirs.join('/')}/${file}.md`
}

export function extractTitleFromPath(path: string): string {
  const filename = path.split('/').pop() || path
  return filename
    .replace(/\.md$/, '')
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function extractTitleFromContent(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  if (match) {
    return match[1].replace(/[*_`]/g, '').trim()
  }
  return 'Untitled'
}

export function getSectionFromPath(path: string): { id: string; title: string } | undefined {
  const match = path.match(/^docs\/(\d+-\w+)/)
  if (!match) return undefined

  const sectionMap: Record<string, { id: string; title: string }> = {
    '01-orientation': { id: 'orientation', title: 'Orientation' },
    '02-learn': { id: 'learn', title: 'Learn' },
    '03-interview': { id: 'interview', title: 'Interview Q&A' },
    '04-reference': { id: 'reference', title: 'Reference' },
    '05-quick-ref': { id: 'quick-ref', title: 'Quick Reference' },
    '06-career': { id: 'career', title: 'Career' },
  }

  return sectionMap[match[1]]
}

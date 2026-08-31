export function pathToSlug(path) {
  return path
    .replace(/^docs\//, '')
    .replace(/\.md$/, '')
    .replace(/\//g, '--')
}

export function extractTitleFromPath(path) {
  const filename = path.split('/').pop() || path
  return filename
    .replace(/\.md$/, '')
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function extractTitleFromContent(content) {
  const match = content.match(/^#\s+(.+)$/m)
  if (match) {
    return match[1].replace(/[*_`]/g, '').trim()
  }
  return 'Untitled'
}

export function getSectionFromPath(path) {
  const match = path.match(/^docs\/(\d+-\w+)/)
  if (!match) return undefined

  const sectionMap = {
    '01-orientation': 'orientation',
    '02-learn': 'learn',
    '03-interview': 'interview',
    '04-reference': 'reference',
    '05-quick-ref': 'quick-ref',
    '06-career': 'career',
  }

  return sectionMap[match[1]]
}

export function extractHeadings(content) {
  const headings = []
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{1,4})\s+(.+)$/)
    if (match) {
      headings.push(match[2].replace(/[*_`#\[\]]/g, '').trim())
    }
  }
  return headings
}

export function extractTags(content, path) {
  const tags = new Set()
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

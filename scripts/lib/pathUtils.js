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
  return extractTitleFromPath(content)
}

export function extractHeadings(content) {
  const headings = []
  for (const line of content.split('\n')) {
    const match = line.match(/^#{1,4}\s+(.+)$/)
    if (match) {
      headings.push(match[1].replace(/[*_`#[\]]/g, '').trim())
    }
  }
  return headings
}

export function extractTags(content) {
  const tags = []
  const tagMatch = content.match(/^tags:\s*\[(.+)\]/m)
  if (tagMatch) {
    tagMatch[1].split(',').forEach((t) => tags.push(t.trim().replace(/['"]/g, '')))
  }
  return tags
}

export function extractExcerpt(content, maxLen = 200) {
  const body = content.replace(/^---[\s\S]*?---\n/, '').replace(/^#.+$/m, '')
  return body.replace(/[#*`[\]]/g, '').trim().slice(0, maxLen)
}

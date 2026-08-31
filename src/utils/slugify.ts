import { SITE_CONFIG } from '@/config/site'

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

function normalizeDocPath(path: string): string {
  return path.startsWith('docs/') ? path : `docs/${path}`
}

/** Resolve a relative href against the current markdown file path. */
export function resolveRelativePath(href: string, currentDocPath: string): string {
  const [pathPart] = href.split('#')
  let path = pathPart.replace(/^\.\//, '')

  if (path.startsWith('docs/')) {
    return path
  }

  const normalized = normalizeDocPath(currentDocPath)
  const currentDir = normalized.includes('/')
    ? normalized.substring(0, normalized.lastIndexOf('/'))
    : 'docs'

  if (path.startsWith('../') || path.startsWith('./')) {
    const segments = currentDir.split('/')
    for (const segment of path.split('/')) {
      if (segment === '..') {
        segments.pop()
      } else if (segment === '.' || segment === '') {
        continue
      } else {
        segments.push(segment)
      }
    }
    return segments.join('/')
  }

  if (path.includes('/')) {
    return `docs/${path}`
  }

  return `${currentDir}/${path}`
}

/** Resolve a markdown href to a docs/…/*.md path (may include #hash). */
export function resolveMdPath(href: string, currentDocPath: string): string {
  if (href.startsWith('http') || href.startsWith('/')) {
    return href
  }

  const hashIndex = href.indexOf('#')
  const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : ''

  let path = resolveRelativePath(pathPart, currentDocPath)

  if (!path.endsWith('.md')) {
    path += '.md'
  }

  return `${path}${hash}`
}

/** Resolve a markdown href to a site slug (may include #hash). */
export function resolveMdLink(href: string, currentDocPath: string): string {
  if (href.startsWith('http')) {
    return href
  }

  if (href.startsWith('/docs/')) {
    return href.replace(/^\/docs\//, '')
  }

  const resolved = resolveMdPath(href, currentDocPath)
  const hashIndex = resolved.indexOf('#')
  const pathOnly = hashIndex >= 0 ? resolved.slice(0, hashIndex) : resolved
  const hash = hashIndex >= 0 ? resolved.slice(hashIndex) : ''
  const slug = pathToSlug(pathOnly.replace(/\.md$/, ''))

  return `${slug}${hash}`
}

const PKG_PATH_RE = /(?:^|\/)(pkg\d[\w]*(?:\/[\w.-]+)?)/
const BUILD_PATH_RE = /(?:^|\/|\.\.\/)(build\/?)/

/** Rewrite repo source links (pkg*, build/, README.md) to GitHub URLs. */
export function resolveRepoLink(href: string, _currentDocPath: string): string | null {
  if (href.startsWith('http') || href.startsWith('/') || href.endsWith('.md')) {
    return null
  }

  const { url, branch } = SITE_CONFIG.github
  const treeBase = `${url}/tree/${branch}`
  const blobBase = `${url}/blob/${branch}`

  if (href.includes('README.md')) {
    return `${blobBase}/README.md`
  }

  const pkgMatch = href.match(PKG_PATH_RE)
  if (pkgMatch) {
    const repoPath = pkgMatch[1]
    return repoPath.endsWith('.java') ? `${blobBase}/${repoPath}` : `${treeBase}/${repoPath}`
  }

  if (BUILD_PATH_RE.test(href)) {
    return `${treeBase}/build`
  }

  return null
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

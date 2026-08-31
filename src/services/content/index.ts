import {
  GITHUB_API_BASE,
  GITHUB_RAW_BASE,
  LOCAL_DOCS_BASE,
  SITE_CONFIG,
} from '@/config/site'
import type { ContentProvider, DocContent, DocNode, GitHubTreeItem } from '@/types'
import {
  calculateReadingTime,
  extractHeadings,
  extractTags,
} from '@/utils/readingTime'
import {
  extractTitleFromContent,
  extractTitleFromPath,
  getSectionFromPath,
  pathToSlug,
} from '@/utils/slugify'

const CACHE_KEY = 'content_cache_v1'
const TREE_CACHE_KEY = 'tree_cache_v1'
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

interface CacheEntry<T> {
  data: T
  timestamp: number
}

function getCached<T>(key: string): T | null {
  try {
    const entry = JSON.parse(localStorage.getItem(key) || 'null') as CacheEntry<T> | null
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data
    }
  } catch {
    // ignore
  }
  return null
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // ignore
  }
}

abstract class BaseContentProvider implements ContentProvider {
  protected contentCache = new Map<string, DocContent>()

  abstract fetchRaw(path: string): Promise<string>
  abstract fetchTree(): Promise<string[]>

  async getTree(): Promise<DocNode[]> {
    const paths = await this.fetchTree()
    return buildTreeFromPaths(paths)
  }

  async getContent(path: string): Promise<DocContent> {
    const normalizedPath = path.startsWith('docs/') ? path : `docs/${path}`

    if (this.contentCache.has(normalizedPath)) {
      return this.contentCache.get(normalizedPath)!
    }

    const raw = await this.fetchRaw(normalizedPath)
    const section = getSectionFromPath(normalizedPath)
    const title = extractTitleFromContent(raw) || extractTitleFromPath(normalizedPath)

    const content: DocContent = {
      path: normalizedPath,
      slug: pathToSlug(normalizedPath),
      title,
      content: raw,
      section: section?.id,
      sectionTitle: section?.title,
      tags: extractTags(raw, normalizedPath),
      headings: extractHeadings(raw),
      readingTimeMinutes: calculateReadingTime(raw),
      isInterview: normalizedPath.includes('03-interview'),
    }

    this.contentCache.set(normalizedPath, content)
    return content
  }

  async getAllContents(): Promise<DocContent[]> {
    const paths = await this.fetchTree()
    const mdPaths = paths.filter((p) => p.endsWith('.md') && !p.includes('00-INDEX'))
    const contents = await Promise.all(
      mdPaths.map((p) => this.getContent(p).catch(() => null))
    )
    return contents.filter((c): c is DocContent => c !== null)
  }
}

export class GitHubContentProvider extends BaseContentProvider {
  private treePaths: string[] | null = null

  async fetchTree(): Promise<string[]> {
    if (this.treePaths) return this.treePaths

    const cached = getCached<string[]>(TREE_CACHE_KEY)
    if (cached) {
      this.treePaths = cached
      return cached
    }

    const branchRes = await fetch(`${GITHUB_API_BASE}/branches/${SITE_CONFIG.github.branch}`)
    if (!branchRes.ok) throw new Error('Failed to fetch branch info')
    const branch = await branchRes.json()

    const treeRes = await fetch(
      `${GITHUB_API_BASE}/git/trees/${branch.commit.sha}?recursive=1`
    )
    if (!treeRes.ok) throw new Error('Failed to fetch repository tree')

    const tree = await treeRes.json()
    const paths = (tree.tree as GitHubTreeItem[])
      .filter((item) => item.type === 'blob' && item.path.startsWith('docs/') && item.path.endsWith('.md'))
      .map((item) => item.path)
      .sort()

    this.treePaths = paths
    setCache(TREE_CACHE_KEY, paths)
    return paths
  }

  async fetchRaw(path: string): Promise<string> {
    const cacheKey = `${CACHE_KEY}_${path}`
    const cached = getCached<string>(cacheKey)
    if (cached) return cached

    const url = `${GITHUB_RAW_BASE}/${path}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${path}`)
    const content = await res.text()
    setCache(cacheKey, content)
    return content
  }
}

export class LocalContentProvider extends BaseContentProvider {
  private manifest: string[] | null = null
  private githubFallback: GitHubContentProvider | null = null

  private getFallback(): GitHubContentProvider {
    if (!this.githubFallback) {
      this.githubFallback = new GitHubContentProvider()
    }
    return this.githubFallback
  }

  async fetchTree(): Promise<string[]> {
    if (this.manifest) return this.manifest

    try {
      const res = await fetch(`${LOCAL_DOCS_BASE}/manifest.json`)
      if (!res.ok) throw new Error(`manifest.json HTTP ${res.status}`)

      const manifest = await res.json()
      if (!Array.isArray(manifest) || manifest.length === 0) {
        throw new Error('manifest.json is empty')
      }

      this.manifest = manifest
      return manifest
    } catch (error) {
      console.warn('[JavaMastery] Local docs unavailable, falling back to GitHub:', error)
      return this.getFallback().fetchTree()
    }
  }

  async fetchRaw(path: string): Promise<string> {
    const url = `${LOCAL_DOCS_BASE}/${path.replace(/^docs\//, '')}`

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const content = await res.text()
      if (isSpaOrHtmlResponse(content)) {
        throw new Error('received HTML instead of markdown (doc likely missing from build)')
      }

      return content
    } catch (error) {
      console.warn(`[JavaMastery] Local fetch failed for ${path}, using GitHub:`, error)
      return this.getFallback().fetchRaw(path)
    }
  }
}

function isSpaOrHtmlResponse(content: string): boolean {
  const trimmed = content.trimStart().slice(0, 200).toLowerCase()
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')
}

function buildTreeFromPaths(paths: string[]): DocNode[] {
  const root: DocNode[] = []
  const sectionMap = new Map<string, DocNode>()

  for (const path of paths) {
    const parts = path.replace(/^docs\//, '').split('/')
    const section = getSectionFromPath(path)
    const sectionKey = parts[0]

    if (!sectionMap.has(sectionKey)) {
      const sectionNode: DocNode = {
        id: sectionKey,
        title: section?.title || formatSectionTitle(sectionKey),
        path: `docs/${sectionKey}`,
        slug: pathToSlug(`docs/${sectionKey}`),
        type: 'directory',
        section: section?.id,
        sectionTitle: section?.title,
        children: [],
        order: parseInt(sectionKey) || 99,
      }
      sectionMap.set(sectionKey, sectionNode)
      root.push(sectionNode)
    }

    if (parts.length === 1) {
      const node: DocNode = {
        id: path,
        title: extractTitleFromPath(path),
        path,
        slug: pathToSlug(path),
        type: 'file',
        section: section?.id,
        sectionTitle: section?.title,
        order: 0,
      }
      sectionMap.get(sectionKey)!.children!.push(node)
    } else if (parts.length === 2) {
      const node: DocNode = {
        id: path,
        title: extractTitleFromPath(path),
        path,
        slug: pathToSlug(path),
        type: 'file',
        section: section?.id,
        sectionTitle: section?.title,
        order: parseInt(parts[1]) || 99,
      }
      sectionMap.get(sectionKey)!.children!.push(node)
    }
  }

  for (const section of root) {
    section.children?.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  return root.sort((a, b) => (a.order || 0) - (b.order || 0))
}

function formatSectionTitle(key: string): string {
  return key.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

let providerInstance: ContentProvider | null = null
let providerMode: 'github' | 'local' | null = null

export function getContentProvider(mode: 'github' | 'local' = 'github'): ContentProvider {
  if (!providerInstance || providerMode !== mode) {
    providerInstance = mode === 'local' ? new LocalContentProvider() : new GitHubContentProvider()
    providerMode = mode
  }
  return providerInstance
}

export function resetContentProvider(): void {
  providerInstance = null
  providerMode = null
}

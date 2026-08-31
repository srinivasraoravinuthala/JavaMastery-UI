import Fuse from 'fuse.js'
import type { SearchResult } from '@/types'
import { getContentProvider } from '@/services/content'

export class SearchService {
  private fuse: Fuse<SearchIndexItem> | null = null
  private index: SearchIndexItem[] = []
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    const provider = getContentProvider()
    const contents = await provider.getAllContents()

    this.index = contents.map((doc) => ({
      path: doc.path,
      slug: doc.slug,
      title: doc.title,
      section: doc.section,
      content: doc.content,
      headings: doc.headings.map((h) => h.text).join(' '),
      tags: (doc.tags || []).join(' '),
    }))

    this.fuse = new Fuse(this.index, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'headings', weight: 0.25 },
        { name: 'content', weight: 0.2 },
        { name: 'tags', weight: 0.15 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    })

    this.initialized = true
  }

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    await this.initialize()
    if (!query.trim() || !this.fuse) return []

    const results = this.fuse.search(query, { limit })

    return results.map((result) => ({
      path: result.item.path,
      slug: result.item.slug,
      title: result.item.title,
      section: result.item.section,
      excerpt: extractExcerpt(result.item.content, query),
      score: 1 - (result.score || 0),
      headings: result.item.headings.split(' ').filter(Boolean).slice(0, 3),
    }))
  }
}

interface SearchIndexItem {
  path: string
  slug: string
  title: string
  section?: string
  content: string
  headings: string
  tags: string
}

function extractExcerpt(content: string, query: string): string {
  const lower = content.toLowerCase()
  const queryLower = query.toLowerCase()
  const index = lower.indexOf(queryLower)

  if (index === -1) {
    return content.slice(0, 150).replace(/[#*`]/g, '').trim() + '...'
  }

  const start = Math.max(0, index - 60)
  const end = Math.min(content.length, index + query.length + 90)
  let excerpt = content.slice(start, end).replace(/[#*`]/g, '').trim()

  if (start > 0) excerpt = '...' + excerpt
  if (end < content.length) excerpt += '...'

  return excerpt
}

let searchInstance: SearchService | null = null

export function getSearchService(): SearchService {
  if (!searchInstance) {
    searchInstance = new SearchService()
  }
  return searchInstance
}

import { useState, useEffect, useCallback } from 'react'
import { CONTENT_MODE } from '@/config/site'
import { getContentProvider } from '@/services/content'
import { slugToPath } from '@/utils/slugify'
import type { DocContent, DocNode } from '@/types'

export function useContentTree() {
  const [tree, setTree] = useState<DocNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const provider = getContentProvider(CONTENT_MODE)
    provider
      .getTree()
      .then(setTree)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { tree, loading, error }
}

export function useDocContent(slug: string | undefined) {
  const [doc, setDoc] = useState<DocContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setError(null)

    try {
      const provider = getContentProvider(CONTENT_MODE)
      const path = slug.includes('--') ? slugToPath(slug) : `docs/${slug}.md`
      const content = await provider.getContent(path)
      setDoc(content)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  return { doc, loading, error, reload: load }
}

export function flattenTree(nodes: DocNode[]): DocNode[] {
  const result: DocNode[] = []
  for (const node of nodes) {
    if (node.type === 'file') {
      result.push(node)
    }
    if (node.children) {
      result.push(...flattenTree(node.children))
    }
  }
  return result
}

export function getAdjacentDocs(
  tree: DocNode[],
  currentSlug: string
): { prev: DocNode | null; next: DocNode | null } {
  const flat = flattenTree(tree)
  const index = flat.findIndex((n) => n.slug === currentSlug)
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  }
}

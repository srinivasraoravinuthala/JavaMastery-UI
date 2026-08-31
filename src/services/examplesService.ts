import {
  GITHUB_RAW_BASE,
  SITE_CONFIG,
} from '@/config/site'
import type { ExampleContent, ExampleIndexEntry, ExamplesIndex } from '@/types/examples'

const EXAMPLES_BASE = '/examples'
const INDEX_URL = '/examples-index.json'

function isHtmlResponse(content: string): boolean {
  const trimmed = content.trimStart().slice(0, 200).toLowerCase()
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')
}

function parseJavaHeader(content: string): { title: string; explanation: string; className: string } {
  const blockMatch = content.match(/^\/\*([\s\S]*?)\*\//)
  if (!blockMatch) return { title: '', explanation: '', className: '' }

  const lines = blockMatch[1].split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim())
  let className = ''
  const explanationLines: string[] = []
  let inExplanation = false

  for (const line of lines) {
    if (!line || line.startsWith('---')) continue
    if (!className && line.endsWith('.java')) {
      className = line.replace(/\.java$/, '')
      continue
    }
    if (line.toUpperCase().startsWith('EXPLANATION:')) {
      inExplanation = true
      const rest = line.replace(/^EXPLANATION:\s*/i, '')
      if (rest) explanationLines.push(rest)
      continue
    }
    if (inExplanation) explanationLines.push(line)
  }

  const explanation = explanationLines.join(' ').trim()
  const title = explanation.split('.')[0]?.trim() || className
  return { title, explanation, className }
}

export class ExamplesService {
  private index: ExamplesIndex | null = null
  private sourceCache = new Map<string, string>()
  private classToPath = new Map<string, string>()

  async getIndex(): Promise<ExamplesIndex> {
    if (this.index) return this.index

    try {
      const res = await fetch(INDEX_URL)
      if (res.ok) {
        this.index = await res.json()
        this.buildClassMap()
        return this.index!
      }
    } catch {
      // fall through
    }

    this.index = {}
    return this.index
  }

  private buildClassMap() {
    if (!this.index) return
    this.classToPath.clear()
    for (const [path, entry] of Object.entries(this.index)) {
      this.classToPath.set(entry.className, path)
      this.classToPath.set(`${entry.className}.java`, path)
    }
  }

  getClassIndex(): Map<string, string> {
    return this.classToPath
  }

  async getAllPaths(): Promise<string[]> {
    const index = await this.getIndex()
    return Object.keys(index).sort()
  }

  async getEntries(): Promise<ExampleIndexEntry[]> {
    const index = await this.getIndex()
    return Object.values(index).sort((a, b) => a.path.localeCompare(b.path))
  }

  async getEntriesByPackage(pkg: string): Promise<ExampleIndexEntry[]> {
    const entries = await this.getEntries()
    return entries.filter((e) => e.package === pkg)
  }

  async getPackages(): Promise<string[]> {
    const entries = await this.getEntries()
    return [...new Set(entries.map((e) => e.package))].sort()
  }

  async fetchSource(repoPath: string): Promise<string> {
    if (this.sourceCache.has(repoPath)) {
      return this.sourceCache.get(repoPath)!
    }

    try {
      const url = `${EXAMPLES_BASE}/${repoPath}`
      const res = await fetch(url)
      if (res.ok) {
        const text = await res.text()
        if (!isHtmlResponse(text)) {
          this.sourceCache.set(repoPath, text)
          return text
        }
      }
    } catch {
      // fall through
    }

    const rawUrl = `${GITHUB_RAW_BASE}/${repoPath}`
    const res = await fetch(rawUrl)
    if (!res.ok) throw new Error(`Failed to load example: ${repoPath}`)
    const text = await res.text()
    this.sourceCache.set(repoPath, text)
    return text
  }

  async getExample(repoPath: string): Promise<ExampleContent> {
    const index = await this.getIndex()
    const entry = index[repoPath]
    const source = await this.fetchSource(repoPath)

    if (entry) {
      return { ...entry, source }
    }

    const header = parseJavaHeader(source)
    const parts = repoPath.split('/')
    const className = parts.pop()?.replace(/\.java$/, '') || repoPath
    const pkg = parts.join('/') || ''

    return {
      path: repoPath,
      package: pkg,
      className,
      title: header.title || className,
      explanation: header.explanation,
      runCommand: `java ${repoPath.replace(/\.java$/, '')}.java`,
      level: 'Other',
      source,
    }
  }

  getGitHubUrl(repoPath: string): string {
    return `${SITE_CONFIG.github.url}/blob/${SITE_CONFIG.github.branch}/${repoPath}`
  }
}

let instance: ExamplesService | null = null

export function getExamplesService(): ExamplesService {
  if (!instance) instance = new ExamplesService()
  return instance
}

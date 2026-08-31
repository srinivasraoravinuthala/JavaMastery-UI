import {
  GITHUB_API_BASE,
  GITHUB_RAW_BASE,
  SITE_CONFIG,
} from '@/config/site'
import type { ExampleContent, ExampleIndexEntry, ExamplesIndex } from '@/types/examples'
import {
  PACKAGE_LEVELS,
  exampleClassName,
  examplePackage,
  exampleRunCommand,
  isExampleJavaPath,
} from '@/utils/exampleIndex'
import { buildOneCompilerUrls } from '@/utils/oneCompiler'

const EXAMPLES_BASE = '/examples'
const INDEX_URL = '/examples-index.json'

function isHtmlResponse(content: string): boolean {
  const trimmed = content.trimStart().slice(0, 200).toLowerCase()
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')
}

function parseJavaHeader(content: string): {
  title: string
  explanation: string
  className: string
  prerequisites: string
  expectedOutput: string
} {
  const blockMatch = content.match(/^\/\*([\s\S]*?)\*\//)
  if (!blockMatch) return { title: '', explanation: '', className: '', prerequisites: '', expectedOutput: '' }

  const lines = blockMatch[1].split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim())
  let className = ''
  const explanationLines: string[] = []
  const prereqLines: string[] = []
  const outputLines: string[] = []
  let inExplanation = false
  let inPrereq = false
  let inOutput = false

  for (const line of lines) {
    if (!line || line.startsWith('---')) continue
    if (!className && line.endsWith('.java')) {
      className = line.replace(/\.java$/, '')
      continue
    }
    if (line.toUpperCase().startsWith('PREREQUISITES:')) {
      inPrereq = true
      inExplanation = false
      inOutput = false
      const rest = line.replace(/^PREREQUISITES:\s*/i, '')
      if (rest) prereqLines.push(rest)
      continue
    }
    if (line.toUpperCase().startsWith('OUTPUT:')) {
      inOutput = true
      inExplanation = false
      inPrereq = false
      const rest = line.replace(/^OUTPUT:\s*/i, '')
      if (rest) outputLines.push(rest)
      continue
    }
    if (line.toUpperCase().startsWith('EXPLANATION:')) {
      inExplanation = true
      inPrereq = false
      inOutput = false
      const rest = line.replace(/^EXPLANATION:\s*/i, '')
      if (rest) explanationLines.push(rest)
      continue
    }
    if (inPrereq) prereqLines.push(line)
    else if (inOutput) outputLines.push(line)
    else if (inExplanation) explanationLines.push(line)
  }

  const explanation = explanationLines.join(' ').trim()
  const title = explanation.split('.')[0]?.trim() || className
  return {
    title,
    explanation,
    className,
    prerequisites: prereqLines.join(' ').trim(),
    expectedOutput: outputLines.join('\n').trim(),
  }
}

function entryFromPath(path: string): ExampleIndexEntry {
  const className = exampleClassName(path)
  const pkg = examplePackage(path)
  return {
    path,
    package: pkg,
    className,
    title: className,
    explanation: '',
    runCommand: exampleRunCommand(path),
    level: PACKAGE_LEVELS[pkg] || 'Other',
  }
}

export class ExamplesService {
  private index: ExamplesIndex | null = null
  private sourceCache = new Map<string, string>()
  private classToPath = new Map<string, string>()

  async getIndex(): Promise<ExamplesIndex> {
    if (this.index && Object.keys(this.index).length > 0) return this.index

    const local = await this.fetchLocalIndex()
    if (local && Object.keys(local).length > 0) {
      this.index = local
      this.buildClassMap()
      return this.index
    }

    const remote = await this.fetchGitHubIndex()
    this.index = remote
    this.buildClassMap()
    return this.index
  }

  private async fetchLocalIndex(): Promise<ExamplesIndex | null> {
    try {
      const res = await fetch(INDEX_URL)
      if (!res.ok) return null
      const text = await res.text()
      if (isHtmlResponse(text)) return null
      const data = JSON.parse(text) as ExamplesIndex
      if (!data || typeof data !== 'object' || Array.isArray(data)) return null
      return data
    } catch {
      return null
    }
  }

  /** Build a minimal index from the JavaMastery GitHub tree when local sync is missing. */
  private async fetchGitHubIndex(): Promise<ExamplesIndex> {
    try {
      const branchRes = await fetch(`${GITHUB_API_BASE}/branches/${SITE_CONFIG.github.branch}`)
      if (!branchRes.ok) return {}
      const branch = await branchRes.json() as { commit: { sha: string } }
      const treeRes = await fetch(
        `${GITHUB_API_BASE}/git/trees/${branch.commit.sha}?recursive=1`
      )
      if (!treeRes.ok) return {}
      const tree = await treeRes.json() as { tree?: Array<{ path: string; type: string }> }
      const index: ExamplesIndex = {}
      for (const item of tree.tree || []) {
        if (item.type !== 'blob' || !isExampleJavaPath(item.path)) continue
        index[item.path] = entryFromPath(item.path)
      }
      return index
    } catch {
      return {}
    }
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
      const header = parseJavaHeader(source)
      return {
        ...entry,
        title: entry.title || header.title || entry.className,
        explanation: entry.explanation || header.explanation,
        source,
        prerequisites: entry.prerequisites || header.prerequisites,
        expectedOutput: entry.expectedOutput || header.expectedOutput,
      }
    }

    const header = parseJavaHeader(source)
    const className = exampleClassName(repoPath)
    const pkg = examplePackage(repoPath)

    return {
      path: repoPath,
      package: pkg,
      className,
      title: header.title || className,
      explanation: header.explanation,
      prerequisites: header.prerequisites,
      expectedOutput: header.expectedOutput,
      runCommand: exampleRunCommand(repoPath),
      level: PACKAGE_LEVELS[pkg] || 'Other',
      source,
    }
  }

  getGitHubUrl(repoPath: string): string {
    return `${SITE_CONFIG.github.url}/blob/${SITE_CONFIG.github.branch}/${repoPath}`
  }

  getCodespacesUrl(repoPath: string): string {
    return `${SITE_CONFIG.github.url}/blob/${SITE_CONFIG.github.branch}/${repoPath}#code-execution`
  }

  getOneCompilerUrl(source: string): string {
    return buildOneCompilerUrls(source).fullTabUrl
  }
}

let instance: ExamplesService | null = null

export function getExamplesService(): ExamplesService {
  if (!instance) instance = new ExamplesService()
  return instance
}

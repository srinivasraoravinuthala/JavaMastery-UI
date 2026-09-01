/** Parse and normalize Java example references from markdown/docs */

const JAVA_CMD_RE = /^java\s+(.+)$/i
const PKG_PATH_RE = /^pkg[\w]+(?:\/[\w./-]+)?$/i
const BARE_CLASS_RE = /^(core|intro|leetcode|concurrency|networking|jdbc|restapi|libs|io|datastructures|algorithms|jvm|patterns|versions|performance|serialization|advconcurrency|metaprogramming|modules|resilience)[\w]+$/i

const PREFIX_TO_PACKAGE: Record<string, string> = {
  intro: 'pkg0intro',
  core: 'pkg1core',
  versions: 'pkg2versions',
  datastructures: 'pkg3datastructures',
  algorithms: 'pkg4algorithms',
  leetcode: 'pkg5leetcode',
  jvm: 'pkg6jvm',
  concurrency: 'pkg7concurrency',
  patterns: 'pkg8patterns',
  io: 'pkg9io',
  networking: 'pkg10networking',
  jdbc: 'pkg11jdbc',
  modules: 'pkg15modules',
  restapi: 'pkg12restapi',
  libs: 'pkg13libs',
  advconcurrency: 'pkg16advconcurrency',
  performance: 'pkg19performance',
  resilience: 'pkg18resiliencepatterns',
  serialization: 'pkg20serialization',
}

function stripRefDecorators(text: string): string {
  return text.trim().replace(/^`|`$/g, '')
}

function defaultPackageForClass(className: string): string | null {
  for (const [prefix, pkg] of Object.entries(PREFIX_TO_PACKAGE)) {
    if (className.startsWith(prefix)) return pkg
  }
  return null
}

/** Whether inline text looks like a runnable example reference */
export function isExampleReference(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  if (JAVA_CMD_RE.test(t)) return true
  if (PKG_PATH_RE.test(t)) return true
  const base = t.replace(/\.java$/i, '')
  if (BARE_CLASS_RE.test(base)) return true
  if (t.startsWith('pkg') && t.endsWith('/')) return false
  return false
}

/** Whether a markdown line introduces runnable example refs (▶️ or corrupted ?? prefix). */
export function isExampleRunLine(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.includes('▶') || /^\?\?\s+`/.test(trimmed)) {
    return splitExampleLine(trimmed).some(isExampleReference)
  }
  return false
}

/** Extract run command or path from text like `java pkg1core/core2Variables.java` */
export function parseRunCommand(text: string): string | null {
  const t = text.trim()
  const javaMatch = t.match(JAVA_CMD_RE)
  if (javaMatch) return javaMatch[1].trim()
  if (PKG_PATH_RE.test(t) || t.includes('pkg')) return t.replace(/\.java$/, '') + (t.endsWith('.java') ? '' : t.includes('/') ? '' : '')
  return null
}

/** Normalize to repo-relative path: pkg1core/core2Variables.java */
export function normalizeExamplePath(
  ref: string,
  indexByClass?: Map<string, string>
): string | null {
  let text = stripRefDecorators(ref)
  if (text.startsWith('java ')) text = text.slice(5).trim()
  if (text.endsWith('/')) return null

  if (text.endsWith('.java') && text.includes('/')) {
    return text
  }

  if (text.includes('/') && text.startsWith('pkg')) {
    return text.endsWith('.java') ? text : `${text}.java`
  }

  const className = text.replace(/\.java$/, '')
  if (BARE_CLASS_RE.test(className)) {
    const withJava = `${className}.java`
    if (indexByClass?.has(className)) return indexByClass.get(className)!
    if (indexByClass?.has(withJava)) return indexByClass.get(withJava)!
    const pkg = defaultPackageForClass(className)
    if (pkg) return `${pkg}/${withJava}`
    return null
  }

  return null
}

export function toRunCommand(repoPath: string): string {
  const path = repoPath.endsWith('.java') ? repoPath : `${repoPath}.java`
  return `java ${path.replace(/\.java$/, '')}.java`.replace(/\.java\.java$/, '.java')
}

export function exampleLabel(repoPath: string): string {
  return repoPath.split('/').pop()?.replace(/\.java$/, '') || repoPath
}

export function toGitHubBlobUrl(repoPath: string, baseUrl: string, branch: string): string {
  return `${baseUrl}/blob/${branch}/${repoPath}`
}

/** Extract all example refs from markdown content */
export function extractExampleRefs(content: string): string[] {
  const refs = new Set<string>()

  for (const line of content.split('\n')) {
    if (line.includes('▶️') || line.includes('`java ') || line.includes('`pkg')) {
      const backtickRe = /`([^`]+)`/g
      let match
      while ((match = backtickRe.exec(line)) !== null) {
        const inner = match[1].trim()
        if (isExampleReference(inner) || inner.startsWith('java ')) {
          refs.add(inner)
        }
      }
    }
  }

  return Array.from(refs)
}

/** Expand range refs like pkg4/algorithms1.java → algorithms7.java using index ordering */
export function expandExampleRefs(
  refs: string[],
  allPaths: string[]
): string[] {
  const result: string[] = []
  const pathSet = new Set(allPaths)

  for (const ref of refs) {
    const arrowParts = ref.split(/\s*→\s*/)
    if (arrowParts.length === 2) {
      const start = normalizeExamplePath(arrowParts[0])
      const end = normalizeExamplePath(arrowParts[1])
      if (start && end) {
        const pkg = start.split('/')[0]
        const sorted = allPaths.filter((p) => p.startsWith(`${pkg}/`)).sort()
        const si = sorted.indexOf(start)
        const ei = sorted.indexOf(end)
        if (si >= 0 && ei >= 0) {
          const [from, to] = si <= ei ? [si, ei] : [ei, si]
          result.push(...sorted.slice(from, to + 1))
          continue
        }
      }
    }

    const normalized = normalizeExamplePath(ref)
    if (normalized && pathSet.has(normalized)) {
      result.push(normalized)
    } else if (normalized) {
      result.push(normalized)
    }
  }

  return [...new Set(result)]
}

/** Split ▶️ line into individual ref strings */
export function splitExampleLine(line: string): string[] {
  const text = line
    .trim()
    .replace(/^▶️?\s*/u, '')
    .replace(/^\?\?\s*/, '')

  const backtickRefs = [...text.matchAll(/`([^`]+)`/g)].map((m) => stripRefDecorators(m[1]))
  if (backtickRefs.length > 0) {
    return backtickRefs
  }

  return text
    .split(/[·•]|\s+\?\s+/)
    .map((s) => stripRefDecorators(s))
    .filter(Boolean)
}

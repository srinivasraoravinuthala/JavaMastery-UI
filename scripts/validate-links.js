#!/usr/bin/env node
/**
 * Validate internal markdown links in JavaMastery docs.
 * Usage: node scripts/validate-links.js [docs-dir]
 * Default docs dir: ../JavaMastery/docs (sibling repo) or public/docs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const DEFAULT_DIRS = [
  join(ROOT, '..', 'JavaMastery', 'docs'),
  join(ROOT, 'public', 'docs'),
]

function findDocsDir() {
  const arg = process.argv[2]
  if (arg) {
    const dir = resolve(arg)
    if (!existsSync(dir)) {
      console.error(`Docs directory not found: ${dir}`)
      process.exit(1)
    }
    return dir
  }
  for (const dir of DEFAULT_DIRS) {
    if (existsSync(dir)) return dir
  }
  console.error('No docs directory found. Pass path: node scripts/validate-links.js <docs-dir>')
  process.exit(1)
}

function normalizeDocPath(path) {
  return path.startsWith('docs/') ? path : `docs/${path}`
}

function resolveRelativePath(href, currentDocPath) {
  const [pathPart] = href.split('#')
  let path = pathPart.replace(/^\.\//, '')

  if (path.startsWith('docs/')) return path

  const normalized = normalizeDocPath(currentDocPath)
  const currentDir = normalized.includes('/')
    ? normalized.substring(0, normalized.lastIndexOf('/'))
    : 'docs'

  if (path.startsWith('../') || path.startsWith('./')) {
    const segments = currentDir.split('/')
    for (const segment of path.split('/')) {
      if (segment === '..') segments.pop()
      else if (segment === '.' || segment === '') continue
      else segments.push(segment)
    }
    return segments.join('/')
  }

  if (path.includes('/')) return `docs/${path}`
  return `${currentDir}/${path}`
}

function resolveMdPath(href, currentDocPath) {
  if (href.startsWith('http') || href.startsWith('/')) return null

  const hashIndex = href.indexOf('#')
  const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href

  let path = resolveRelativePath(pathPart, currentDocPath)
  if (!path.endsWith('.md')) path += '.md'
  return path
}

function walkMdFiles(dir, base = dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walkMdFiles(full, base))
    } else if (entry.endsWith('.md')) {
      files.push(full)
    }
  }
  return files
}

const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g

function validateLinks(docsDir) {
  const mdFiles = walkMdFiles(docsDir)
  const broken = []

  for (const file of mdFiles) {
    const relFromDocs = file.slice(docsDir.length + 1).replace(/\\/g, '/')
    const currentDocPath = `docs/${relFromDocs}`
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let match
      LINK_RE.lastIndex = 0
      while ((match = LINK_RE.exec(line)) !== null) {
        const href = match[2].trim()
        if (!href.endsWith('.md')) continue
        if (href.startsWith('http')) continue

        const resolved = resolveMdPath(href, currentDocPath)
        if (!resolved) continue

        const targetPath = join(docsDir, '..', resolved)
        if (!existsSync(targetPath)) {
          broken.push({
            file: currentDocPath,
            line: i + 1,
            href,
            resolved,
          })
        }
      }
    }
  }

  return broken
}

const docsDir = findDocsDir()
console.log(`Validating links in ${docsDir}...`)

const broken = validateLinks(docsDir)

if (broken.length === 0) {
  console.log('All internal markdown links are valid.')
  process.exit(0)
}

console.error(`\nFound ${broken.length} broken link(s):\n`)
for (const b of broken) {
  console.error(`  ${b.file}:${b.line}`)
  console.error(`    href: ${b.href}`)
  console.error(`    resolved: ${b.resolved} (not found)\n`)
}
process.exit(1)

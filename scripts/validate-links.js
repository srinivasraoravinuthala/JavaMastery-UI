#!/usr/bin/env node
/**
 * Validate internal markdown links in JavaMastery docs.
 * Usage: node scripts/validate-links.js [docs-dir]
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
  console.error('No docs directory found. Pass path as argument.')
  process.exit(1)
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

function normalizeDocPath(path) {
  return path.startsWith('docs/') ? path : `docs/${path}`
}

function resolveRelativePath(href, currentDocPath) {
  const [pathPart] = href.split('#')
  const path = pathPart.replace(/^\.\//, '')

  if (path.startsWith('docs/')) return path

  const normalized = normalizeDocPath(currentDocPath)
  const relativeFromDocs = normalized.replace(/^docs\//, '')
  const dirParts = relativeFromDocs.includes('/')
    ? relativeFromDocs.substring(0, relativeFromDocs.lastIndexOf('/')).split('/')
    : []

  if (path.startsWith('../') || path.startsWith('./')) {
    for (const segment of path.split('/')) {
      if (segment === '..') dirParts.pop()
      else if (segment !== '.' && segment !== '') dirParts.push(segment)
    }
    return dirParts.length > 0 ? `docs/${dirParts.join('/')}` : 'docs'
  }

  if (path.includes('/')) return `docs/${path}`
  return dirParts.length > 0 ? `docs/${dirParts.join('/')}/${path}` : `docs/${path}`
}

function resolveMdPath(href, currentDocPath) {
  if (href.startsWith('http') || href.startsWith('/')) return href

  const hashIndex = href.indexOf('#')
  const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : ''

  let path = resolveRelativePath(pathPart, currentDocPath)
  if (!path.endsWith('.md')) path += '.md'
  return `${path}${hash}`
}

const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g

function validateLinks(docsDir) {
  const mdFiles = walkMdFiles(docsDir)
  const docPaths = new Set(
    mdFiles.map((f) => {
      const rel = f.slice(docsDir.length + 1).replace(/\\/g, '/')
      return `docs/${rel}`
    })
  )

  const errors = []

  for (const file of mdFiles) {
    const relPath = file.slice(docsDir.length + 1).replace(/\\/g, '/')
    const currentDocPath = `docs/${relPath}`
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let match
      LINK_RE.lastIndex = 0
      while ((match = LINK_RE.exec(line)) !== null) {
        const href = match[2]
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) continue
        if (!href.includes('.md') && !href.startsWith('../') && !href.startsWith('./')) continue

        const resolved = resolveMdPath(href, currentDocPath)
        const pathOnly = resolved.split('#')[0]
        if (!docPaths.has(pathOnly)) {
          errors.push({ file: currentDocPath, line: i + 1, href, resolved: pathOnly })
        }
      }
    }
  }

  return errors
}

const docsDir = findDocsDir()
console.log(`Validating links in ${docsDir}...`)
const errors = validateLinks(docsDir)

if (errors.length > 0) {
  console.error(`\n${errors.length} broken link(s):\n`)
  for (const err of errors) {
    console.error(`  ${err.file}:${err.line}  ${err.href} → ${err.resolved} (not found)`)
  }
  process.exit(1)
}

console.log('All internal markdown links are valid.')

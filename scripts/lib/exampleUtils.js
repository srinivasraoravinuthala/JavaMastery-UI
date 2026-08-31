/** Shared helpers for sync-examples.js and prepare-local-examples.js */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export function parseJavaHeader(content) {
  const blockMatch = content.match(/^\/\*([\s\S]*?)\*\//)
  if (!blockMatch) {
    return { title: '', explanation: '', className: '' }
  }

  const block = blockMatch[1]
  const lines = block.split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim())

  let className = ''
  const explanationLines = []
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

    if (inExplanation) {
      explanationLines.push(line)
    }
  }

  const explanation = explanationLines.join(' ').trim()
  const title = explanation.split('.')[0]?.trim() || className

  return { title, explanation, className }
}

export function toRunCommand(repoPath) {
  const path = repoPath.endsWith('.java') ? repoPath : `${repoPath}.java`
  return `java ${path.replace(/\.java$/, '')}.java`.replace(/\.java\.java$/, '.java')
}

export function extractClassName(repoPath) {
  const name = repoPath.split('/').pop() || repoPath
  return name.replace(/\.java$/, '')
}

export function extractPackage(repoPath) {
  const parts = repoPath.split('/')
  return parts.length > 1 ? parts[0] : parts[0]?.replace(/\.java$/, '') || ''
}

export function extractRefsFromMarkdown(content) {
  const refs = []
  const backtickRe = /`([^`]+)`/g
  let match
  while ((match = backtickRe.exec(content)) !== null) {
    refs.push(match[1].trim())
  }
  return refs
}

export function normalizeRefToPath(ref) {
  let text = ref.trim()
  if (text.startsWith('java ')) text = text.slice(5).trim()
  if (text.endsWith('/')) return null

  if (/^pkg[\w]+/.test(text)) {
    if (!text.includes('.java')) {
      if (!text.includes('/')) return null
      if (!text.endsWith('.java')) text = `${text}.java`
    }
    return text
  }

  if (text.endsWith('.java') && text.includes('/')) return text
  return null
}

export function buildLearnChapterMap(docsDir) {
  const map = {}
  const learnDir = join(docsDir, '02-learn')
  if (!existsSync(learnDir)) return map

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
      } else if (entry.endsWith('.md') && entry !== '00-INDEX.md') {
        const content = readFileSync(full, 'utf-8')
        const slug = `02-learn--${entry.replace(/\.md$/, '')}`
        for (const ref of extractRefsFromMarkdown(content)) {
          const normalized = normalizeRefToPath(ref)
          if (normalized) map[normalized] = slug
        }
      }
    }
  }

  walk(learnDir)
  return map
}

export const PACKAGE_LEVELS = {
  pkg0intro: 'Orientation',
  pkg1core: 'Beginner',
  pkg2versions: 'Intermediate',
  pkg3datastructures: 'Computer Science',
  pkg4algorithms: 'Computer Science',
  pkg5leetcode: 'Computer Science',
  pkg6jvm: 'Senior',
  pkg7concurrency: 'Tech Lead',
  pkg8patterns: 'Tech Lead',
  pkg9io: 'Applied Java',
  pkg10networking: 'Applied Java',
  pkg11jdbc: 'Applied Java',
  pkg12restapi: 'Applied Java',
  pkg13libs: 'Applied Java',
  pkg14testing: 'Ecosystem',
  pkg16advconcurrency: 'Tech Lead',
  pkg17metaprogramming: 'Ecosystem',
  pkg19performance: 'Ecosystem',
  pkg20serialization: 'Ecosystem',
}

export function isExampleJavaPath(path) {
  return /^pkg[\w]/.test(path) && path.endsWith('.java') && !path.includes('/src/test/')
}

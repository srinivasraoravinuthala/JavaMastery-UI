#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  pathToSlug,
  extractTitleFromContent,
  extractHeadings,
  extractTags,
  extractExcerpt,
} from './lib/pathUtils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCS_DIR = join(ROOT, 'public', 'docs')
const EXAMPLES_INDEX = join(ROOT, 'public', 'examples-index.json')
const OUTPUT = join(ROOT, 'public', 'search-index.json')

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

function loadExamples() {
  if (!existsSync(EXAMPLES_INDEX)) return []
  const index = JSON.parse(readFileSync(EXAMPLES_INDEX, 'utf-8'))
  return Object.values(index).map((entry) => ({
    path: entry.path,
    slug: `example--${entry.path.replace(/\//g, '--').replace(/\.java$/, '')}`,
    title: entry.title || entry.className,
    section: entry.package,
    content: [entry.className, entry.title, entry.explanation, entry.runCommand, entry.package].join(' '),
    headings: entry.className,
    tags: [entry.package, entry.level, 'example', 'java'].filter(Boolean).join(' '),
    excerpt: entry.explanation || entry.title || entry.className,
    kind: 'example',
    package: entry.package,
    runCommand: entry.runCommand,
    learnChapter: entry.learnChapter,
  }))
}

function main() {
  const mdFiles = walkMdFiles(DOCS_DIR)
  const docIndex = mdFiles.map((file) => {
    const rel = file.slice(DOCS_DIR.length + 1).replace(/\\/g, '/')
    const path = `docs/${rel}`
    const content = readFileSync(file, 'utf-8')
    const headings = extractHeadings(content)

    return {
      path,
      slug: pathToSlug(path),
      title: extractTitleFromContent(content),
      section: path.split('/')[1]?.replace(/^\d+-/, '') || '',
      content,
      headings: headings.join(' '),
      tags: extractTags(content).join(' '),
      excerpt: extractExcerpt(content),
      kind: 'doc',
    }
  })

  const exampleIndex = loadExamples()
  const index = [...docIndex, ...exampleIndex]

  writeFileSync(OUTPUT, JSON.stringify(index, null, 2))
  console.log(`Built search index with ${docIndex.length} docs + ${exampleIndex.length} examples → public/search-index.json`)
}

main()

#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
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

function main() {
  const mdFiles = walkMdFiles(DOCS_DIR)
  const index = mdFiles.map((file) => {
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
    }
  })

  writeFileSync(OUTPUT, JSON.stringify(index, null, 2))
  console.log(`Built search index with ${index.length} documents → public/search-index.json`)
}

main()

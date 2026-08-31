#!/usr/bin/env node
/**
 * Build a static search index from synced docs in public/docs/.
 * Usage: node scripts/build-search-index.js
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  pathToSlug,
  extractTitleFromPath,
  extractTitleFromContent,
  getSectionFromPath,
  extractHeadings,
  extractTags,
} from './lib/pathUtils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCS_DIR = join(ROOT, 'public', 'docs')
const MANIFEST_PATH = join(DOCS_DIR, 'manifest.json')
const OUTPUT_PATH = join(ROOT, 'public', 'search-index.json')

function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error('manifest.json not found. Run: npm run sync-docs')
    process.exit(1)
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
  const index = []

  for (const docPath of manifest) {
    if (docPath.includes('00-INDEX')) continue

    const localPath = join(DOCS_DIR, docPath.replace(/^docs\//, ''))
    if (!existsSync(localPath)) {
      console.warn(`Skipping missing file: ${docPath}`)
      continue
    }

    const content = readFileSync(localPath, 'utf-8')
    const title = extractTitleFromContent(content) || extractTitleFromPath(docPath)
    const headings = extractHeadings(content)

    index.push({
      path: docPath,
      slug: pathToSlug(docPath),
      title,
      section: getSectionFromPath(docPath),
      content,
      headings: headings.join(' '),
      tags: extractTags(content, docPath).join(' '),
    })
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(index))
  console.log(`Built search index with ${index.length} documents → public/search-index.json`)
}

main()

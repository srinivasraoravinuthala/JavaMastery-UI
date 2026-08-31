#!/usr/bin/env node
/**
 * Generate sitemap.xml from synced docs manifest.
 * Usage: node scripts/generate-sitemap.js
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pathToSlug } from './lib/pathUtils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCS_DIR = join(ROOT, 'public', 'docs')
const MANIFEST_PATH = join(DOCS_DIR, 'manifest.json')
const OUTPUT_PATH = join(ROOT, 'public', 'sitemap.xml')

const SITE_URL = 'https://javamastery.srinivasrao.co.in'

function main() {
  const urls = [{ loc: `${SITE_URL}/`, priority: '1.0' }]

  if (existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))

    for (const docPath of manifest) {
      if (docPath.includes('00-INDEX')) continue
      const slug = pathToSlug(docPath)
      urls.push({
        loc: `${SITE_URL}/docs/${slug}`,
        priority: docPath.includes('02-learn') ? '0.9' : '0.8',
      })
    }
  }

  urls.push({ loc: `${SITE_URL}/bookmarks`, priority: '0.5' })

  const body = urls
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

  writeFileSync(OUTPUT_PATH, xml)
  console.log(`Generated sitemap with ${urls.length} URLs → public/sitemap.xml`)
}

main()

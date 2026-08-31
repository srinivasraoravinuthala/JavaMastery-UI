#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pathToSlug } from './lib/pathUtils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCS_DIR = join(ROOT, 'public', 'docs')
const MANIFEST = join(DOCS_DIR, 'manifest.json')
const OUTPUT = join(ROOT, 'public', 'sitemap.xml')
const SITE_URL = 'https://javamastery.srinivasrao.co.in'

function main() {
  let paths = []
  if (existsSync(MANIFEST)) {
    paths = JSON.parse(readFileSync(MANIFEST, 'utf-8'))
  }

  const urls = [
    { loc: SITE_URL, priority: '1.0' },
    ...paths.map((path) => ({
      loc: `${SITE_URL}/docs/${pathToSlug(path)}`,
      priority: '0.8',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`

  writeFileSync(OUTPUT, xml)
  console.log(`Generated sitemap with ${urls.length} URLs → public/sitemap.xml`)
}

main()

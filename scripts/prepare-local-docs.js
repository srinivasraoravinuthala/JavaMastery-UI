#!/usr/bin/env node
/**
 * Copy docs from a local directory into public/docs/ and write manifest.json.
 * Usage: node scripts/prepare-local-docs.js [source-docs-dir]
 * Default: ../JavaMastery/docs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DEFAULT_SOURCE = join(ROOT, '..', 'JavaMastery', 'docs')
const TARGET = join(ROOT, 'public', 'docs')

function walkMdFiles(dir, base = dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walkMdFiles(full, base))
    } else if (entry.endsWith('.md')) {
      files.push(relative(base, full).replace(/\\/g, '/'))
    }
  }
  return files
}

function main() {
  const source = process.argv[2] ? join(process.cwd(), process.argv[2]) : DEFAULT_SOURCE

  if (!existsSync(source)) {
    console.error(`Source docs not found: ${source}`)
    process.exit(1)
  }

  const files = walkMdFiles(source)
  const manifest = []

  for (const rel of files) {
    const src = join(source, rel)
    const dest = join(TARGET, rel)
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(src, dest)
    manifest.push(`docs/${rel}`)
  }

  manifest.sort()
  writeFileSync(join(TARGET, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`Prepared ${manifest.length} docs → public/docs/`)
}

main()

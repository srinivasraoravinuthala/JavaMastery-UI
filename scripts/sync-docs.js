#!/usr/bin/env node
/**
 * Sync docs from GitHub repository to public/docs for local mode.
 * Usage: node scripts/sync-docs.js
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCS_DIR = join(ROOT, 'public', 'docs')

const GITHUB_API = 'https://api.github.com/repos/srinivasraoravinuthala/JavaMastery'
const BRANCH = process.env.DOCS_BRANCH || process.argv[2] || 'main'
const GITHUB_RAW = `https://raw.githubusercontent.com/srinivasraoravinuthala/JavaMastery/${BRANCH}`

async function fetchTree() {
  const branchRes = await fetch(`${GITHUB_API}/branches/${BRANCH}`)
  const branch = await branchRes.json()
  const treeRes = await fetch(`${GITHUB_API}/git/trees/${branch.commit.sha}?recursive=1`)
  const tree = await treeRes.json()
  return tree.tree
    .filter((item) => item.type === 'blob' && item.path.startsWith('docs/') && item.path.endsWith('.md'))
    .map((item) => item.path)
}

async function downloadFile(path) {
  const url = `${GITHUB_RAW}/${path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed: ${path}`)
  return res.text()
}

async function main() {
  console.log('Fetching file tree from GitHub...')
  const paths = await fetchTree()
  console.log(`Found ${paths.length} markdown files`)

  const manifest = []

  for (const path of paths) {
    const localPath = join(DOCS_DIR, path.replace(/^docs\//, ''))
    const dir = dirname(localPath)

    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    const content = await downloadFile(path)
    writeFileSync(localPath, content, 'utf-8')
    manifest.push(path)
    process.stdout.write('.')
  }

  writeFileSync(join(DOCS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`\nSynced ${manifest.length} files to public/docs/`)
}

main().catch(console.error)

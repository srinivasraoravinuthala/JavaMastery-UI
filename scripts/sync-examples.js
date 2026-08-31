#!/usr/bin/env node
/**
 * Sync Java examples from GitHub to public/examples/
 * Usage: node scripts/sync-examples.js [branch]
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  parseJavaHeader,
  toRunCommand,
  extractClassName,
  extractPackage,
  buildLearnChapterMap,
  PACKAGE_LEVELS,
  isExampleJavaPath,
} from './lib/exampleUtils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EXAMPLES_DIR = join(ROOT, 'public', 'examples')
const DOCS_DIR = join(ROOT, 'public', 'docs')

const REPO = 'srinivasraoravinuthala/JavaMastery'
const BRANCH = process.argv[2] || process.env.DOCS_BRANCH || 'main'
const GITHUB_API = `https://api.github.com/repos/${REPO}`
const GITHUB_RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`

async function fetchJavaPaths() {
  const branchRes = await fetch(`${GITHUB_API}/branches/${BRANCH}`)
  if (!branchRes.ok) throw new Error(`Branch not found: ${BRANCH}`)
  const branch = await branchRes.json()
  const treeRes = await fetch(`${GITHUB_API}/git/trees/${branch.commit.sha}?recursive=1`)
  const tree = await treeRes.json()
  return tree.tree
    .filter((item) => item.type === 'blob' && isExampleJavaPath(item.path))
    .map((item) => item.path)
    .sort()
}

async function downloadFile(path) {
  const res = await fetch(`${GITHUB_RAW}/${path}`)
  if (!res.ok) throw new Error(`Failed: ${path}`)
  return res.text()
}

async function main() {
  console.log(`Fetching Java examples from GitHub (${BRANCH})...`)
  const paths = await fetchJavaPaths()
  console.log(`Found ${paths.length} example files`)

  const learnChapterMap = existsSync(DOCS_DIR)
    ? buildLearnChapterMap(DOCS_DIR)
    : {}

  const index = {}

  for (const path of paths) {
    const content = await downloadFile(path)
    const localPath = join(EXAMPLES_DIR, path)
    mkdirSync(dirname(localPath), { recursive: true })
    writeFileSync(localPath, content, 'utf-8')

    const header = parseJavaHeader(content)
    const pkg = extractPackage(path)
    const className = extractClassName(path)

    index[path] = {
      path,
      package: pkg,
      className,
      title: header.title || className,
      explanation: header.explanation,
      runCommand: toRunCommand(path),
      level: PACKAGE_LEVELS[pkg] || 'Other',
      learnChapter: learnChapterMap[path] || undefined,
    }
    process.stdout.write('.')
  }

  writeFileSync(join(ROOT, 'public', 'examples-index.json'), JSON.stringify(index, null, 2))
  console.log(`\nSynced ${paths.length} examples → public/examples/`)
}

main().catch(console.error)

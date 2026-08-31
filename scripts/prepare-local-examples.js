#!/usr/bin/env node
/**
 * Copy Java examples from local JavaMastery repo into public/examples/
 * Usage: node scripts/prepare-local-examples.js [repo-root]
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
  copyFileSync,
} from 'fs'
import { join, dirname, relative } from 'path'
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
const DEFAULT_REPO = join(ROOT, '..', 'JavaMastery')
const EXAMPLES_DIR = join(ROOT, 'public', 'examples')

function walkJavaFiles(dir, base = dir) {
  const files = []
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue
      files.push(...walkJavaFiles(full, base))
    } else if (entry.endsWith('.java')) {
      const rel = relative(base, full).replace(/\\/g, '/')
      if (isExampleJavaPath(rel)) files.push(rel)
    }
  }
  return files
}

function main() {
  const repoRoot = process.argv[2] ? join(process.cwd(), process.argv[2]) : DEFAULT_REPO
  if (!existsSync(repoRoot)) {
    console.error(`Repo not found: ${repoRoot}`)
    process.exit(1)
  }

  const paths = walkJavaFiles(repoRoot)
  const docsDir = join(repoRoot, 'docs')
  const learnChapterMap = existsSync(docsDir) ? buildLearnChapterMap(docsDir) : {}
  const index = {}

  for (const path of paths) {
    const src = join(repoRoot, path)
    const dest = join(EXAMPLES_DIR, path)
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(src, dest)

    const content = readFileSync(src, 'utf-8')
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
  }

  writeFileSync(join(ROOT, 'public', 'examples-index.json'), JSON.stringify(index, null, 2))
  console.log(`Prepared ${paths.length} examples → public/examples/`)
}

main()

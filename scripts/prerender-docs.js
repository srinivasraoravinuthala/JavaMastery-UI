#!/usr/bin/env node
/**
 * Emit static HTML shells under dist/ so Cloudflare serves crawlable content
 * before SPA fallback. React still hydrates for interactivity.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pathToSlug, extractTitleFromContent, extractExcerpt } from './lib/pathUtils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const DOCS = join(ROOT, 'public', 'docs')
const MANIFEST = join(DOCS, 'manifest.json')
const SITE = 'https://javamastery.srinivasrao.co.in'
const OG = `${SITE}/og-default.svg`

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let inCode = false
  let codeLang = ''
  let listOpen = false

  const closeList = () => {
    if (listOpen) {
      out.push('</ul>')
      listOpen = false
    }
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        out.push('</code></pre>')
        inCode = false
      } else {
        closeList()
        codeLang = line.slice(3).trim()
        out.push(`<pre><code class="language-${escapeHtml(codeLang)}">`)
        inCode = true
      }
      continue
    }
    if (inCode) {
      out.push(escapeHtml(line) + '\n')
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      closeList()
      const level = heading[1].length
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      if (!listOpen) {
        out.push('<ul>')
        listOpen = true
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
      continue
    }

    if (!line.trim()) {
      closeList()
      continue
    }

    closeList()
    out.push(`<p>${inline(line)}</p>`)
  }
  closeList()
  if (inCode) out.push('</code></pre>')
  return out.join('\n')
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

function pageShell({ title, description, canonical, bodyHtml, jsonLd }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="${OG}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${OG}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="module" crossorigin src="/assets/index.js"></script>
  <link rel="stylesheet" crossorigin href="/assets/index.css">
</head>
<body>
  <div id="root"></div>
  <noscript>
    <main>
      <article>
        ${bodyHtml}
      </article>
    </main>
  </noscript>
  <!-- Crawler-visible mirror (hidden from visual users when JS loads) -->
  <div id="prerender-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">
    <article>${bodyHtml}</article>
  </div>
</body>
</html>
`
}

function writePage(relPath, html) {
  const full = join(DIST, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, html, 'utf8')
}

function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ missing — run vite build first')
    process.exit(1)
  }

  // Patch index.html assets: read built index for real hashed asset names
  const builtIndex = readFileSync(join(DIST, 'index.html'), 'utf8')
  const scriptMatch = builtIndex.match(/src="(\/assets\/[^"]+\.js)"/)
  const cssMatch = builtIndex.match(/href="(\/assets\/[^"]+\.css)"/)
  const scriptSrc = scriptMatch?.[1] || '/assets/index.js'
  const cssHref = cssMatch?.[1] || '/assets/index.css'

  const wrap = (opts) =>
    pageShell(opts)
      .replace('/assets/index.js', scriptSrc)
      .replace('/assets/index.css', cssHref)

  // Home
  writePage(
    'index.html',
    wrap({
      title: 'JavaMastery — Learn Java from Basics to Senior Level',
      description:
        'Learn Java from basics to senior level. Tutorials, interview Q&A, runnable examples, and hands-on projects.',
      canonical: SITE,
      bodyHtml:
        '<h1>JavaMastery</h1><p>Learn Java from basics to senior level with tutorials, interview Q&amp;A, examples, and projects.</p>',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'JavaMastery',
        url: SITE,
      },
    })
  )

  writePage(
    'examples/index.html',
    wrap({
      title: 'Java Examples — JavaMastery',
      description: 'Browse and run Java example programs from the JavaMastery curriculum.',
      canonical: `${SITE}/examples`,
      bodyHtml:
        '<h1>Java Examples</h1><p>Browse runnable Java examples organized by package.</p>',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Java Examples',
        url: `${SITE}/examples`,
      },
    })
  )

  writePage(
    'projects/index.html',
    wrap({
      title: 'Projects — JavaMastery',
      description: 'Hands-on Java labs from console apps to Spring Boot + browser UI.',
      canonical: `${SITE}/projects`,
      bodyHtml:
        '<h1>Projects</h1><p>Hands-on labs: gradebook, library OOP, todo REST, Spring notes API, and HTML frontend.</p>',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Projects',
        url: `${SITE}/projects`,
      },
    })
  )

  let paths = []
  if (existsSync(MANIFEST)) {
    paths = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  }

  let count = 0
  for (const docPath of paths) {
    const file = join(DOCS, docPath.replace(/^docs\//, ''))
    if (!existsSync(file)) continue
    const md = readFileSync(file, 'utf8')
    const title = extractTitleFromContent(md)
    const description = extractExcerpt(md, 160) || `${title} — JavaMastery`
    const slug = pathToSlug(docPath)
    const canonical = `${SITE}/docs/${slug}`
    const bodyHtml = mdToHtml(md)
    writePage(
      `docs/${slug}/index.html`,
      wrap({
        title: `${title} — JavaMastery`,
        description,
        canonical,
        bodyHtml,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title,
          description,
          url: canonical,
        },
      })
    )
    count++
  }

  console.log(`Prerendered home, examples, and ${count} docs → dist/`)
}

main()

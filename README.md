# JavaMastery-UI

**Live site:** [javamastery.srinivasrao.co.in](https://javamastery.srinivasrao.co.in)

> Learn Java from basics to senior level. Tutorials, 1000+ interview questions, and reference guides — all in one place.

The reading website for the [JavaMastery](https://github.com/srinivasraoravinuthala/JavaMastery) content repository. Docs are bundled at build time — no GitHub API calls in production.

## What it does

- Bundles all markdown from [JavaMastery](https://github.com/srinivasraoravinuthala/JavaMastery) at build time
- 37 tutorial chapters, 19 interview topics, reference guides
- Search, dark mode, syntax-highlighted code, interview prep mode, chapter progress
- Works on mobile, tablet, and desktop

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 (GitHub mode by default)
npm run build:prod   # sync docs + search index + sitemap + production build
npm run preview      # preview dist/
```

## Content source

| | |
|---|---|
| **Website** | [javamastery.srinivasrao.co.in](https://javamastery.srinivasrao.co.in) |
| **Content repo** | [github.com/srinivasraoravinuthala/JavaMastery](https://github.com/srinivasraoravinuthala/JavaMastery) |
| **Production mode** | Local bundled docs (`VITE_CONTENT_MODE=local` via `.env.production`) |
| **Dev mode** | Live GitHub API (`VITE_CONTENT_MODE=github` in `.env.local`) |

## Branch strategy

| Branch | Purpose |
|--------|---------|
| **`main`** | Production — Cloudflare deploys from this branch |
| **`develop`** | Integration — merge to `main` when ready to publish |

**Content updates:** Merge doc changes in JavaMastery → `main`. The site rebuilds via [repository dispatch](.github/workflows/deploy-on-content.yml) (when configured) or run `npm run build:prod` and deploy manually.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Local dev server |
| `npm run build:prod` | Sync docs from GitHub + build for production |
| `npm run validate-links` | Check internal markdown links |
| `npm run test` | Unit tests (link resolver, etc.) |
| `npm run sync-docs` | Pull docs into `public/docs/` |

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · React Markdown · Prism · Fuse.js · Cloudflare Workers

## Deploy

Build command: `npm run build:prod`  
Deploy: Cloudflare Workers — see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Auto-rebuild (optional)

1. **JavaMastery repo** — add secret `UI_REPO_DISPATCH_TOKEN` (PAT with `repo` scope on this repo)
2. **This repo** — add secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
3. **This repo** — set variable `ENABLE_AUTO_DEPLOY=true`
4. **Analytics (optional)** — set `VITE_CF_ANALYTICS_TOKEN` in Cloudflare build env

When docs change on JavaMastery `main`, the site rebuilds automatically. A daily cron (06:00 UTC) syncs as a fallback.

## Project structure

```
src/
├── components/   # UI, layout, markdown, search
├── pages/        # Home, docs, bookmarks
├── services/     # Content loading + search
├── hooks/        # Theme, search, bookmarks, progress
└── config/       # Site settings
scripts/          # sync-docs, validate-links, sitemap, search index
```

## License

MIT

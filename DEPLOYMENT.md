# Deployment Guide — JavaMastery-UI

## Prerequisites

- Node.js 22+
- Cloudflare account with Workers Git integration

## Production build (recommended)

```bash
npm run build:prod
```

This will:

1. Sync docs from JavaMastery `main` via `scripts/sync-docs.js`
2. Build `public/search-index.json` and `public/sitemap.xml`
3. Run Vite build with `VITE_CONTENT_MODE=local` (from `.env.production`)

Set Cloudflare build command to **`npm run build:prod`**.

## Cloudflare Workers SPA routing

`wrangler.toml` includes:

```toml
[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

This ensures direct URL refreshes on `/docs/*` routes serve `index.html` instead of 404.

## Environment variables

| Variable | Production value | Purpose |
|----------|------------------|---------|
| `VITE_CONTENT_MODE` | `local` | Serve pre-synced docs from `/docs/` (no runtime GitHub API) |
| `VITE_CF_ANALYTICS_TOKEN` | (optional) | Cloudflare Web Analytics |

For local dev with live GitHub content: `VITE_CONTENT_MODE=github` in `.env`.

## CI

GitHub Actions (`.github/workflows/ci.yml`):

```
npm ci → test → validate-links → lint → build:ci
```

PR builds copy sibling JavaMastery docs via `prepare-local-docs.js`.

## Auto-rebuild on content changes

JavaMastery can dispatch `content-updated` events (see `trigger-ui-rebuild.yml`).
JavaMastery-UI listens via `deploy-on-content.yml` (daily cron fallback included).

Optional deploy: set repo variable `ENABLE_AUTO_DEPLOY=true` and Cloudflare secrets.

## Manual deploy

```bash
npm run build:prod
npx wrangler deploy
```

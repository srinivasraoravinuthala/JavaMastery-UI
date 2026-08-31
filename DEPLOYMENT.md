# Deployment Guide — JavaMastery-UI

This guide covers deploying JavaMastery-UI to **Cloudflare Pages**.

## Prerequisites

- Node.js 20+
- A Cloudflare account
- Git repository with this project

## Cloudflare Workers (Git Integration)

This project is deployed as a **Worker with static assets** (not legacy Pages).

1. Push `JavaMastery-UI` to your GitHub/GitLab repository
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
3. Create or open the Worker named **`javamastery`** (must match `name` in `wrangler.toml`)
4. Connect the Git repository under **Settings → Builds**
5. Configure build settings:

| Setting | Value |
|---------|-------|
| Build command | `npm run build:prod` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Root directory | `/` |

> **Recommended:** Use `npm run build:prod` for production. This syncs docs from GitHub, builds a static search index and sitemap, and bundles everything in **local mode** (no runtime GitHub API calls).

> **Important:** Do **not** use `npx wrangler pages deploy` — that is for Cloudflare Pages. Workers Git builds use `npx wrangler deploy` and `npx wrangler versions upload` for preview branches.

6. Environment variables are optional — `.env.production` sets `VITE_CONTENT_MODE=local` automatically for production builds.

7. Click **Save** and retry the deployment

## Cloudflare Pages (Legacy / CLI only)

For manual CLI upload to Pages (optional):

```bash
cd JavaMastery-UI
npm install
npm run build
npx wrangler pages deploy dist --project-name=javamastery-ui
```

## SPA Routing

For **Cloudflare Workers** (current deployment), SPA fallback is configured in `wrangler.toml`:

```toml
[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

This ensures direct URL access and page refreshes on `/docs/*` routes serve `index.html` instead of a CDN 404.

The `public/_redirects` file is a legacy fallback for Cloudflare Pages / Netlify:

```
/*    /index.html   200
```

## Content Modes in Production

### Local Mode (recommended for production)

Production builds use **local mode** via `.env.production`:

```bash
npm run build:prod
```

This command:

1. Syncs all markdown from GitHub (`scripts/sync-docs.js`)
2. Builds a static search index (`public/search-index.json`)
3. Generates `public/sitemap.xml`
4. Bundles docs in `public/docs/` — no runtime GitHub API calls

Benefits: faster page loads, no API rate limits, instant search, works offline.

### GitHub Mode (development)

For local dev while iterating on UI without re-syncing docs:

```bash
# .env.local
VITE_CONTENT_MODE=github
npm run dev
```

Content is fetched from GitHub API at runtime and cached in localStorage for 1 hour.

## Custom Domain

1. Cloudflare Pages → your project → **Custom domains**
2. Add your domain (e.g., `javamastery.srinivasrao.co.in`)
3. Update DNS as instructed
4. SSL is automatic

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_CONTENT_MODE` | `github` (dev) / `local` (prod) | Content loading mode |
| `VITE_CF_ANALYTICS_TOKEN` | _(empty)_ | Optional Cloudflare Web Analytics beacon token |
| `DOCS_BRANCH` | `main` | Branch to sync in `npm run sync-docs` |

`.env.production` sets `VITE_CONTENT_MODE=local` automatically for production builds.

### Cloudflare Web Analytics

1. Cloudflare Dashboard → **Analytics** → **Web Analytics** → add your site
2. Copy the beacon token
3. Add `VITE_CF_ANALYTICS_TOKEN` to Cloudflare Workers build environment variables

Or enable Web Analytics for your zone in the dashboard — traffic is tracked automatically without a token.

## CI / CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR to `main` or `develop` | Test, validate links, build |
| `deploy-on-content.yml` | Content dispatch, daily cron, manual | `build:prod` + optional Cloudflare deploy |
| `docs-links.yml` (JavaMastery) | Docs changes | Validate markdown links |

### GitHub secrets (JavaMastery → UI auto-rebuild)

| Repo | Secret / Variable | Purpose |
|------|-------------------|---------|
| JavaMastery | `UI_REPO_DISPATCH_TOKEN` | PAT to trigger UI rebuild on doc push to `main` |
| JavaMastery-UI | `CLOUDFLARE_API_TOKEN` | Wrangler deploy |
| JavaMastery-UI | `CLOUDFLARE_ACCOUNT_ID` | Wrangler deploy |
| JavaMastery-UI | `ENABLE_AUTO_DEPLOY` (variable) | Set to `true` to enable deploy job |

## Build Verification

```bash
npm run build:prod
npm run preview
```

Visit `http://localhost:4173` and verify:
- Homepage loads with stats and topic cards
- Sidebar shows documentation sections
- Search works (`Ctrl+K`)
- A doc page renders markdown with syntax highlighting
- Dark mode toggles correctly

## Performance Tips

- Code splitting is configured for vendor, markdown, and mermaid chunks
- Content is lazy-loaded per page
- GitHub content is cached in localStorage
- Use local mode for fastest initial search index build

## Troubleshooting

### `Missing entry-point to Worker script or to assets directory`

Your Worker project needs `[assets]` in `wrangler.toml` and deploy commands for **Workers**, not Pages:

- Deploy command: `npx wrangler deploy`
- Non-production: `npx wrangler versions upload`

Also ensure the Worker name in the dashboard matches `name` in `wrangler.toml` (e.g. `javamastery`).

### 404 on direct URL access
Ensure `_redirects` is in `public/` and copied to `dist/`.

### Content not loading
- Production uses **local mode** — run `npm run build:prod` to re-sync docs
- For dev with GitHub API: set `VITE_CONTENT_MODE=github` in `.env.local`
- GitHub API rate limit in dev mode: wait or use `npm run sync-docs` + local mode

### Build fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Other Platforms

The `dist` folder works on any static host:

- **Netlify** — Add `_redirects` or `netlify.toml` with SPA redirect
- **Vercel** — Automatic SPA support
- **GitHub Pages** — Use `base` in vite.config.ts if serving from subdirectory

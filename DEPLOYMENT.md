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
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Root directory | `/` |

> **Important:** Do **not** use `npx wrangler pages deploy` — that is for Cloudflare Pages. Workers Git builds use `npx wrangler deploy` and `npx wrangler versions upload` for preview branches.

6. Add environment variables under **Variables and secrets** (build + runtime):

| Variable | Value |
|----------|-------|
| `VITE_CONTENT_MODE` | `github` |

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

The `public/_redirects` file ensures client-side routing works:

```
/*    /index.html   200
```

Cloudflare Pages reads this automatically from the `dist` folder.

## Content Modes in Production

### GitHub Mode (default)

- Content fetched from GitHub API at runtime
- No build-time content sync needed
- Respects GitHub API rate limits (60 req/hr unauthenticated)
- Content cached in localStorage for 1 hour

For higher rate limits, users can authenticate via GitHub token (future enhancement).

### Local Mode

For fully static deployment without GitHub API calls:

```bash
npm run sync-docs
```

Set `VITE_CONTENT_MODE=local` before building. All markdown is bundled in `public/docs/`.

## Custom Domain

1. Cloudflare Pages → your project → **Custom domains**
2. Add your domain (e.g., `javamastery.srinivasrao.co.in`)
3. Update DNS as instructed
4. SSL is automatic

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_CONTENT_MODE` | `github` | `github` or `local` |

Create `.env.production`:

```env
VITE_CONTENT_MODE=github
```

## Build Verification

```bash
npm run build
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
- Check browser console for GitHub API errors
- Verify `VITE_CONTENT_MODE=github` is set
- GitHub API rate limit: wait or switch to local mode

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

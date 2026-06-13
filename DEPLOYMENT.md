# Deployment Guide — JavaMastery-UI

This guide covers deploying JavaMastery-UI to **Cloudflare Pages**.

## Prerequisites

- Node.js 20+
- A Cloudflare account
- Git repository with this project

## Cloudflare Pages (Recommended)

### Option A: Git Integration

1. Push `JavaMastery-UI` to your GitHub/GitLab repository
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select your repository
5. Configure build settings:

| Setting | Value |
|---------|-------|
| Framework preset | None (or Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Deploy command | *(leave empty)* |
| Root directory | `JavaMastery-UI` (if monorepo) |

> **Important:** Do **not** set a deploy command to `npx wrangler deploy`. That command is for Cloudflare Workers, not Pages. Pages automatically publishes the `dist` folder after the build succeeds.

6. Add environment variables:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `20` |
| `VITE_CONTENT_MODE` | `github` |

7. Click **Save and Deploy**

### Option B: Direct Upload (Wrangler CLI)

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

This happens when the **Deploy command** is set to `npx wrangler deploy` in Cloudflare Pages settings. That deploys a Worker, not a static Vite site.

**Fix:** Cloudflare Dashboard → your Pages project → **Settings** → **Builds & deployments** → clear the **Deploy command** field (leave it empty). Keep:

- Build command: `npm run build`
- Build output directory: `dist`

Then retry the deployment.

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

# JavaMastery-UI

**Live site:** [javamastery.srinivasrao.co.in](https://javamastery.srinivasrao.co.in)

Reading website for [JavaMastery](https://github.com/srinivasraoravinuthala/JavaMastery) — tutorials, 1000+ interview questions, and reference guides.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 (github mode)
npm run build:prod   # sync docs + local mode production build
```

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — Cloudflare deploys from here |
| `develop` | Active development — open PRs to `main` |

Content source of truth: **JavaMastery `main`**. Production uses `npm run build:prod` to sync docs at build time.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run sync-docs` | Pull docs from GitHub into `public/docs/` |
| `npm run validate-links` | Check internal markdown links |
| `npm run test` | Vitest (link resolver unit tests) |
| `npm run build:ci` | CI build with checked-out JavaMastery docs |

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · Fuse.js

See [DEPLOYMENT.md](DEPLOYMENT.md) for Cloudflare Workers setup.

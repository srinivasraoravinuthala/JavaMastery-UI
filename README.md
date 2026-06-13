# JavaMastery-UI

**Live site:** [javamastery.srinivasrao.co.in](https://javamastery.srinivasrao.co.in)

> Learn Java from basics to senior level. Tutorials, 1000+ interview questions, and reference guides — all in one place.

The reading website for the [JavaMastery](https://github.com/srinivasraoravinuthala/JavaMastery) GitHub repository. Content lives on GitHub; this project is the UI that turns it into a clean docs site — no GitHub browsing needed.

## What it does

- Loads all markdown docs from [JavaMastery](https://github.com/srinivasraoravinuthala/JavaMastery) at runtime
- 37 tutorial chapters, 18 interview topics, reference guides
- Search, dark mode, syntax-highlighted code, interview prep mode
- Works on mobile, tablet, and desktop

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output → dist/
```

## Content source

| | |
|---|---|
| **Website** | [javamastery.srinivasrao.co.in](https://javamastery.srinivasrao.co.in) |
| **Content repo** | [github.com/srinivasraoravinuthala/JavaMastery](https://github.com/srinivasraoravinuthala/JavaMastery) |
| **Default mode** | Fetches docs from GitHub API (`VITE_CONTENT_MODE=github`) |

Update docs in the GitHub repo → the website shows new content automatically.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · React Markdown · Prism · Fuse.js

## Deploy

Build command: `npm run build`  
Output folder: `dist`  
Platform: Cloudflare Pages (see [DEPLOYMENT.md](./DEPLOYMENT.md))

## Project structure

```
src/
├── components/   # UI, layout, markdown, search
├── pages/        # Home, docs, bookmarks
├── services/     # GitHub + local content loading
├── hooks/        # Theme, search, bookmarks
└── config/       # Site settings
```

## License

MIT

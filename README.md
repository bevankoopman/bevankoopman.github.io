Bevan’s Homepage
======================

Bevan Koopman's homepage, built with [Astro](https://astro.build) and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `master`.

- `npm install`, then `npm run dev` to preview locally, or `npm run build` to build into `dist/`.
- **Publications** come from `src/data/publications.bib`. Besides the usual BibTeX fields the site reads `pdf`, `slides` (paths under `public/`), `code` (URL), `pubtype` (journal, long, short, workshop, notebook, abstract, preprint, thesis, editor, tutorial, demo, data, code) and `featured` (`llm-search`, `agentic-eval` or `medical-ai`, shown on the research cards). The build fails if a `pdf` or `slides` file is missing.
- **Page text** (titles, bio, links, research themes) lives in `src/data/site.ts`.
- Static files (`papers/`, `img/`, `presentations/`) live in `public/` and keep their URLs.
- `node scripts/check-urls.mjs dist` checks every URL the old site served still exists.

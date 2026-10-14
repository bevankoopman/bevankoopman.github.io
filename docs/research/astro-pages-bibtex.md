# Astro on GitHub Pages and BibTeX parsing options

Research for issue #7 (part of map #1). Researched 2026-10-14. Every claim cites a primary source; versions were checked against the npm registry and GitHub releases on that date.

## TL;DR

1. **Deploy:** use the official `withastro/action@v6` in a two-job workflow (build, then `actions/deploy-pages@v5`), triggered on `master`. Set `site: 'https://bevankoopman.github.io'` and **no `base`**. Switch Settings → Pages → Source from "Deploy from a branch" to **GitHub Actions**. To avoid downtime, cut over in two steps: first deploy the *current* static files through Actions, then swap in Astro.
2. **BibTeX:** use **`@retorquere/bibtex-parser`** (v12.1.7). It is actively maintained, ships native ESM with types, converts LaTeX accents and markup to Unicode/HTML, and keeps custom fields like `pdf` and `type` untouched. citation-js silently drops `pdf` and renames `type`, and the small parsers are unmaintained or leave LaTeX in place.
3. **PDFs:** move `papers/` (plus `presentations/`, `img/`, `iss/`, `favicon.ico`, `keybase.txt`) into `public/`. Astro copies them to `dist/` byte for byte, so `/papers/<file>.pdf` stays the same. The main gotcha is page URLs: Astro's default `build.format: 'directory'` turns `phd.html` into `/phd/`, so set `build.format: 'preserve'` (or `'file'`).

---

## 1. Deploying Astro to a `<user>.github.io` site

### What Astro recommends

- The Astro docs call the official action [`withastro/action`](https://github.com/withastro/action) "the recommended way to deploy to GitHub Pages" ([Astro docs: Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/), source [`withastro/docs` github.mdx](https://github.com/withastro/docs/blob/main/src/content/docs/en/guides/deploy/github.mdx)).
- The workflow in the docs uses `actions/checkout@v7`, `withastro/action@v6`, `actions/deploy-pages@v5`, permissions `contents: read`, `pages: write`, `id-token: write`, and a `deploy` job in the `github-pages` environment (same source).
- The latest releases on 2026-10-14 were `withastro/action` v6.1.3 (2026-09-14), `actions/checkout` v7.0.1, `actions/deploy-pages` v5.0.1, and `actions/upload-pages-artifact` v5.0.0 (GitHub releases API).
- What `withastro/action@v6` does ([action.yml](https://github.com/withastro/action/blob/main/action.yml)):
  - It finds the package manager from the lockfile. If there is no lockfile it **fails** ("No lockfile found"), so commit `package-lock.json`.
  - It sets up Node with a **default of 24**, installs, restores and saves the Astro cache (`node_modules/.astro`), and runs `<pm> run build`.
  - It uploads `dist/` with `actions/upload-pages-artifact` (v5, `include-hidden-files: true`).
  - Inputs: `path`, `node-version`, `package-manager`, `build-cmd`, `cache`, `cache-dir`, `out-dir`.
- **Hand-written alternative:** GitHub's own starter workflow [`actions/starter-workflows/pages/astro.yml`](https://github.com/actions/starter-workflows/blob/main/pages/astro.yml) is older: `checkout@v4`, Node 20, `upload-pages-artifact@v3`. It sets `--site/--base` from `actions/configure-pages`. Its one useful addition is `concurrency: { group: "pages", cancel-in-progress: false }`, which is worth copying into the Astro-docs workflow. Otherwise the official action is simpler and more current, so a hand-written workflow gains nothing here.

Recommended `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]        # default branch here is master, not main
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

### `site` / `base`

- `site` must be `https://<username>.github.io`. `base` "can skip this if your repository name matches the special `<username>.github.io` pattern" ([Astro docs](https://docs.astro.build/en/guides/deploy/github/)).
- So here: `site: 'https://bevankoopman.github.io'` and no `base`. Root-relative links like `/papers/x.pdf` then work unchanged.

### Pages source switch

- GitHub has two publishing sources: a branch, or a GitHub Actions workflow. If you use "a build process other than Jekyll", the Actions source is recommended ([GitHub docs: Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), source [github/docs](https://github.com/github/docs/blob/main/content/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site.md)).
- In the UI: Settings → Pages → Build and deployment → Source → **GitHub Actions**. Pages "does not associate a specific workflow" with the setting (same source).
- In the API: `PUT /repos/{owner}/{repo}/pages` with `build_type` set to `workflow` (or `legacy` for branch builds) ([GitHub REST API description](https://github.com/github/rest-api-description), `build_type` enum). For example: `gh api -X PUT repos/bevankoopman/bevankoopman.github.io/pages -f build_type=workflow`.
- Current state, from `GET /repos/bevankoopman/bevankoopman.github.io/pages`: `build_type: "legacy"`, `source: {branch: master, path: /}`, `https_enforced: false`. HTTPS enforcement is off, and it is worth turning on during the cutover.
- The workflow uses the `github-pages` environment, which is created automatically. GitHub recommends a protection rule so that only the default branch can deploy (same source).
- With an Actions deploy, Jekyll never runs, so you do not need `.nojekyll`. Folders starting with an underscore, such as Astro's `_astro/`, are served as-is. The GitHub docs only describe `.nojekyll` for branch-based external CI.

### Limits

- A published Pages site may be up to **1 GB**, with a soft bandwidth limit of 100 GB/month. The 10-builds-per-hour soft limit "does not apply if you build and publish your site with a custom GitHub Actions workflow" ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).
- Today's assets total about 130 MB (`papers/` 118 MB, `presentations/` 12 MB), well under the limit.

### Cutting over without downtime

**The risk:** while the source is still "Deploy from a branch", any push to `master` gets served raw from the repo root. If you merge the Astro project first, the root `index.html` disappears (it moves into `src/`) and the live site breaks until you flip the source. If you flip the source before any workflow has deployed, the result depends on behaviour that is not documented.

**Safe sequence.** These are inferences from the docs above, not a documented GitHub procedure:

1. **PR A (no visible change):** add a workflow that publishes the *current* static files through Actions. Use the static starter: `actions/upload-pages-artifact` with `path: .`, then `deploy-pages` ([starter-workflows/pages/static.yml](https://github.com/actions/starter-workflows/blob/main/pages/static.yml)). Merge it, switch Source to GitHub Actions, then run it with `workflow_dispatch` and check the site. The content is identical, so visitors see no change. (You can also flip the source first and then merge; either way the site serves the same bytes.)
2. **PR B:** replace the repo with the Astro project and swap the workflow for the `withastro/action` one above. Before merging:
   - Run `npm run build` locally.
   - Check that every old URL still exists in `dist/`, for example by diffing a list of today's served paths against `find dist -type f`.
   - Check with `astro preview`.

   Merging deploys atomically. If something breaks, revert the PR, or redeploy an earlier run from the Actions tab.
3. Optional: enable "Enforce HTTPS" (currently off).

Note: `publish.sh` also mirrors the repo to `koopman.id.au` via `git pull` on that server. That mirror would get raw Astro sources, not the build, so it needs its own decision.

---

## 2. BibTeX parsing at build time

### Candidates (npm registry and GitHub on 2026-10-14)

| Package | Latest | Last activity | ESM | LaTeX → Unicode | Keeps `pdf` / `type` |
|---|---|---|---|---|---|
| [`@retorquere/bibtex-parser`](https://github.com/retorquere/bibtex-parser) | 12.1.7 | repo pushed 2026-10-14 | Native ESM + CJS + types (`exports`); optional WASM build | Yes (accents, `\&`, `--`→–, `{\em}`→`<i>`), braces stripped | **Yes, both, verbatim** |
| [`citation-js`](https://github.com/citation-js/citation-js) (`@citation-js/core` + `plugin-bibtex`) | 0.9.0 | repo pushed 2026-10-11 | CJS, importable from ESM | Yes | **No.** It drops `pdf` and maps `type` → CSL `genre` |
| [`bibtex-parse`](https://github.com/FlamingTempura/bibtex-parse) | 2.1.0 | repo pushed 2021-09 | CJS | Partial and broken (`J'er\^ome`, `\em` left in) | Yes (uppercased keys) |
| [`@orcid/bibtex-parse-js`](https://github.com/ORCID/bibtexParseJs) | 0.0.25 | repo pushed 2023-09 | CJS | **No**, raw LaTeX and braces kept | Yes |
| [`biblatex-csl-converter`](https://www.npmjs.com/package/biblatex-csl-converter) | 3.6.0 | 2026-07 | ESM | Yes | LGPL-3.0. Not tested; aims at a CSL/Fidus Writer data model |

### Empirical test

I parsed one entry with each library (Node v26, script in the session scratchpad, not committed):

```bibtex
@inproceedings{koopman2016,
  author = {Koopman, Bevan and Zuccon, Guido and M{\"u}ller, J{\'e}r{\^o}me and {CSIRO Team}},
  title = {A Test Collection for {Matching} {P}atients to {C}linical {T}rials \& {SNOMED CT}},
  booktitle = {Proceedings of {SIGIR}}, year = {2016}, month = jul, pages = {669--672},
  pdf = {papers/sigir2016-clinical_trials.pdf}, type = {conference},
  note = {Best paper {\em honourable} mention, 50\% acceptance}
}
```

- **@retorquere/bibtex-parser** `parse(src)` returned `entries[0].fields` with:
  - authors as `{lastName:'Müller', firstName:'Jérôme'}`, and `{name:'CSIRO Team'}` for the braced corporate author;
  - title `"A Test Collection for Matching Patients to Clinical Trials & SNOMED CT"`;
  - `pages: "669–672"`, `month: "7"`;
  - `pdf: "papers/sigir2016-clinical_trials.pdf"`, parsed in *verbatim* mode, so underscores and paths are safe;
  - `type: "conference"`;
  - note `"Best paper <i>honourable</i> mention, 50% acceptance"`;
  - `errors: []`.

  The entry type is kept separately as `entry.type = "inproceedings"`, so the custom `type` field does not clash with it.
- **citation-js** produced the same clean authors and title as CSL-JSON, but `pdf` was **missing** from the output and `type: conference` became `genre`. To get `pdf` back you would have to re-parse the raw text kept in `_graph`.
- **bibtex-parse** mangled accents (`M"uller, J'er\^ome`) and left `\em` in place.
- **@orcid/bibtex-parse-js** returned raw LaTeX with braces.

### Relevant parser options

From `dist/types/index.d.ts` of the package:

- `unsupported: 'ignore' | 'keep' | 'throw'`, default `keep` ([README](https://github.com/retorquere/bibtex-parser#unknown-tex-commands)). Use `'throw'` in CI to catch stray LaTeX.
- `verbatimFields`: add custom fields here if any others hold paths or URLs.
- `caseProtection`, `sentenceCase`, `english`: case handling for titles.
- `raw`: skip the LaTeX → Unicode conversion.
- `parseAsync` exists, and `parseVerbatim` returns un-normalized strings.

Rich-text fields such as `note` and `title` can contain HTML tags (`<i>`, `<b>`, `<span class="nocase">`). Render them with Astro's `set:html` and limit them to known tags, or strip the tags.

### Recommendation

Use **`@retorquere/bibtex-parser`**. It is the parser behind Better BibTeX for Zotero (README), has the best LaTeX handling, keeps custom fields, and is native ESM.

To wire it into Astro, use the content layer `file()` loader with a custom `parser`. It "accept[s] a custom `parser` for data files it cannot parse by default", and the parser may return an array of entries with unique `id`s ([Astro content loader reference](https://docs.astro.build/en/reference/content-loader-reference/#file-loader)):

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { parse } from '@retorquere/bibtex-parser';

const publications = defineCollection({
  loader: file('src/data/publications.bib', {
    parser: (text) => {
      const lib = parse(text, { unsupported: 'throw' });
      if (lib.errors.length) throw new Error(JSON.stringify(lib.errors));
      return lib.entries.map((e) => ({ id: e.key, entryType: e.type, ...e.fields }));
    },
  }),
  // add a zod schema to validate pdf/type/year etc.
});
export const collections = { publications };
```

An inline `loader: async () => …` function works too ([same reference, "Defining a loader as a function"](https://docs.astro.build/en/reference/content-loader-reference/#defining-a-loader-as-a-function)).

Add a build-time check that each `pdf` value exists under `public/`, so a typo fails CI instead of producing a 404.

---

## 3. Keeping `papers/*.pdf` at identical URLs

- Files in `public/` "will be copied into the build folder untouched". The Astro docs use `public/my-cv.pdf` as their own example ([Astro docs: Project structure, `public/`](https://docs.astro.build/en/basics/project-structure/#public)).
- So `public/papers/X.pdf` builds to `dist/papers/X.pdf`. That is served at `https://bevankoopman.github.io/papers/X.pdf`, because `base` is unset and Pages serves `dist/` as the site root.
- The `publicDir` option defaults to `./public` ([Astro config reference](https://docs.astro.build/en/reference/configuration-reference/#publicdir)).
- Use `git mv papers public/papers` (and the same for `presentations/`, `img/`, `iss/`, `favicon.ico`, `keybase.txt`) so file history is kept.

### Gotchas

- **Page URLs, not PDFs, are the real risk.** `build.format` defaults to `'directory'`, so `src/pages/phd.astro` builds `/phd/index.html` and the existing `/phd.html` URL would 404.
  - `'preserve'` builds `about.astro` as `/about.html` and `about/index.astro` as `/about/index.html` ([Astro config reference: build.format](https://docs.astro.build/en/reference/configuration-reference/#buildformat)). That matches today's `/phd.html` and `/iss/` layout.
  - The docs suggest pairing the format with a `trailingSlash` setting to keep dev and build consistent (same source).
  - Another option is to keep legacy HTML pages unchanged in `public/`.
- **Case and exact filenames:** names like `KoopmanPhDThesis-SemanticSearchAsInference.pdf` and `ADCS2012GraphIR-Slides.pdf` are mixed-case, and URL paths on Pages are case-sensitive. `git mv` keeps the names exactly; do not rename or lowercase them. None of the 91 files have spaces in their names.
- **No processing:** `public/` files are not hashed or optimized (Astro docs). That is what you want for stable PDF URLs. Do not `import` the PDFs from `src/`, because that would fingerprint them under `/_astro/`.
- **Links from BibTeX:** store `pdf = {papers/x.pdf}` and render it as `/${pdf}` (root-relative). With no `base`, no prefixing is needed.
- **Size:** about 130 MB is uploaded as the Pages artifact on every deploy, which is fine against the 1 GB site limit ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)). If you ever move the PDFs to Git LFS, `actions/checkout` needs `lfs: true`. They are not in LFS today.
- **Verification:** before merging the Astro PR, list the served files today (`git ls-files` on master, excluding sources) and check that each path exists in `dist/`.

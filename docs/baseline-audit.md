# Research Starter Lab Baseline Audit

Baseline captured on 2026-08-06 for production at <https://student-research-lab-theta.vercel.app/>.

## Repository

- Current branch: `main`
- Current commit hash: `c021208f551f85b71cfdcab9b2b984a764901911`
- Git remote: `origin` → `https://github.com/Dellin3/student-research-lab.git` (fetch and push)
- Working tree before this step: clean; `main` was up to date with `origin/main`
- Runtime observed: Node.js `v24.16.0`; npm `11.13.0`

## Tech Stack

- Framework: React `19.2.x` single-page application built with Vite `8.0.x`
- Router: React Router DOM `7.18.x`; `BrowserRouter` in `src/main.jsx` and declarative `Routes`/`Route` definitions in `src/App.jsx`
- Deployment: Vercel static SPA deployment with eight explicit route rewrites to `/index.html`
- Metadata/SEO system: static metadata and JSON-LD in `index.html`, plus client-side per-route title and description updates through React Helmet Async
- Major runtime dependencies: `react`, `react-dom`, `react-router-dom`, and `react-helmet-async`
- Styling: global `src/index.css` plus the application-wide `src/App.css`; no CSS modules or component-scoped styles
- Package scripts:
  - Development: `npm run dev` → `vite`
  - Lint: `npm run lint` → `eslint .`
  - Build: `npm run build` → `vite build`
  - Preview: `npm run preview` → `vite preview`
  - Tests: no test command is configured

## Current Routes

All listed page titles and descriptions are applied after client hydration by the shared `PageMeta` component. All nine intended production URLs returned HTTP 200 during this audit.

| URL path | Component/page | Page title | H1 | Present in sitemap? | Route-specific metadata? | Notes |
|---|---|---|---|---|---|---|
| `/` | `HomePage` | `Home \| Research Starter Lab` | `Research Starter Lab` | Yes | Yes: title and description | Static HTML initially contains the generic site title before hydration. |
| `/start-here` | `StartHerePage` | `Start Here \| Research Starter Lab` | `Start here` | Yes | Yes: title and description | Explicit Vercel rewrite supports direct refresh. |
| `/find-a-direction` | `FindDirectionPage` | `Find a Direction \| Research Starter Lab` | `Find a direction` | Yes | Yes: title and description | Explicit Vercel rewrite supports direct refresh. |
| `/research-workflow` | `WorkflowPage` | `Research Workflow \| Research Starter Lab` | `Research is iterative` | Yes | Yes: title and description | Explicit Vercel rewrite supports direct refresh. |
| `/ai-literature` | `AiLiteraturePage` | `AI & Literature \| Research Starter Lab` | `AI & literature` | Yes | Yes: title and description | Explicit Vercel rewrite supports direct refresh. |
| `/build-a-project` | `BuildProjectPage` | `Build a Project \| Research Starter Lab` | `Build a project` | Yes | Yes: title and description | Explicit Vercel rewrite supports direct refresh. |
| `/outreach` | `OutreachPage` | `Outreach \| Research Starter Lab` | `Outreach` | Yes | Yes: title and description | Explicit Vercel rewrite supports direct refresh. |
| `/worksheet` | `WorksheetPage` | `Worksheet \| Research Starter Lab` | `Student research worksheet` | Yes | Yes: title and description | Interactive form persists only when the user selects Save progress. |
| `/case-studies` | `CaseStudiesPage` | `Case Studies \| Research Starter Lab` | `Case studies` | Yes | Yes: title and description | Contains an external case-study link that opens in a new tab with `noopener noreferrer`. |
| `*` | `NotFoundPage` | No route-specific title | `This page is not in the research notebook.` | No | No | Works after client-side navigation, but an unknown direct production URL returns Vercel HTTP 404 before the SPA renders. |

Route definitions are duplicated across `NAV_ITEMS`, the `Routes` tree, `vercel.json`, `public/sitemap.xml`, `public/sitemap.txt`, and `public/llms.txt`. Footer and homepage links add further route references.

## Build Baseline

- Lint result: passed; `npm run lint` completed with exit code 0 and no ESLint findings
- Build result: passed; `npm run build` completed with exit code 0
- Tests result: no tests configured
- JavaScript bundle: `dist/assets/index-09ZGUZJv.js` — 285.30 kB, 90.06 kB gzip
- CSS bundle: `dist/assets/index-C1coTgTb.css` — 18.12 kB, 4.64 kB gzip
- HTML output: `dist/index.html` — 1.77 kB, 0.68 kB gzip
- Vite build warnings: none
- Other command warnings/notices:
  - npm reports unknown environment config `devdir`, which will stop working in the next npm major version.
  - npm reports that version `12.0.2` is available; no upgrade was performed.

## SEO Baseline

- Current production domain: `https://student-research-lab-theta.vercel.app/`
- Stale domain found: the legacy non-`-theta` Vercel deployment host
  - Used by both sitemap declarations in `public/robots.txt`
  - Used for every URL in `public/sitemap.txt`
  - Used for every page URL in `public/llms.txt`
- Canonical behavior: no canonical link exists in `index.html`, React Helmet output, or any other searched repository file. Routes therefore do not declare canonical URLs.
- `robots.txt` status:
  - Allows all user agents.
  - References XML and text sitemaps on the stale domain.
- Sitemap status:
  - `public/sitemap.xml` contains all nine current routes and uses the current `-theta` production domain.
  - `public/sitemap.txt` contains the same nine routes but uses the stale non-`-theta` domain.
  - The two sitemap files and `robots.txt` therefore disagree about sitemap location and canonical host.
- Metadata behavior:
  - `index.html` supplies one generic title, description, robots directive, Open Graph set, Twitter set, and `WebSite` JSON-LD object to every server response.
  - Each real application route uses `PageMeta` to replace only the document title and description after JavaScript loads.
  - No route-specific canonical, Open Graph, Twitter, or structured-data values are produced.
- Social metadata behavior:
  - Open Graph and Twitter title/description are global and static.
  - There is no `og:url`, `og:image`, `twitter:image`, or route-specific social metadata.
  - `twitter:card` is set to `summary`.
- Rendering implication: crawlers and link-preview systems that do not execute JavaScript receive the same generic metadata for every route.

## Architecture Risks

1. **Monolithic application file:** `src/App.jsx` contains shared data, navigation, all page components, routing, metadata, worksheet state, and browser integrations in one 421-line file. Changes to one page can affect the entire application bundle and make isolated testing/refactoring harder.
2. **Duplicated route definitions:** routes are independently repeated in navigation, React Router, Vercel rewrites, XML sitemap, text sitemap, and LLM documentation. Existing domain drift demonstrates that these copies are not synchronized.
3. **Stale production domains:** `robots.txt`, `sitemap.txt`, and `llms.txt` point to the legacy non-`-theta` Vercel host, while production and `sitemap.xml` use the current `-theta` host.
4. **No canonical URLs:** no page identifies a canonical URL, leaving host and route consolidation ambiguous to search engines.
5. **Client-only rendering:** Vite emits one application shell, and route content and route-specific title/description are generated only after React hydration. Server HTML and social previews are not route-specific.
6. **Brittle direct-refresh configuration:** the eight non-root routes work in production because each is manually listed in `vercel.json`. A newly added route will fail on direct refresh unless its rewrite is added separately.
7. **Inconsistent 404 behavior:** React has a wildcard `NotFoundPage`, but an unknown direct production URL returns Vercel's 404 before React renders. Client navigation and direct navigation therefore produce different results, and the client 404 has no dedicated metadata.
8. **Incomplete social metadata:** all routes share generic Open Graph/Twitter fields, and image and URL fields are absent.
9. **Worksheet persistence is an implicit data contract:** user data is stored as JSON under `localStorage` key `research-starter-worksheet`. Renaming fields, changing the key, or replacing the worksheet without migration would strand existing saved work.
10. **No automated tests:** routing, metadata, local persistence, clearing, printing, external-link safety, and direct-refresh behavior have no regression coverage.

Additional maintainability observation: `src/index.css` and `src/App.css` both define global root design tokens, including overlapping names such as `--navy`, `--gold`, and `--sage`. Behavior depends on stylesheet import order.

## Existing Features That Must Be Preserved

- Nine working application pages with desktop and responsive navigation.
- Sticky header, active-route navigation state, mobile menu toggle, footer navigation, and scroll-to-top on pathname change.
- Direct production refresh support for all eight non-root routes currently listed in `vercel.json`.
- Client-side not-found page for unmatched routes reached after the SPA has loaded.
- Per-route document titles and meta descriptions through React Helmet Async.
- Static site metadata, JSON-LD, robots directive, favicon, Apple touch icon, Google site-verification file, robots file, and both sitemap formats.
- Responsive layouts at the existing 1180 px, 850 px, and 560 px breakpoints.
- Research pathway, field examples, workflow, literature guidance, project guidance, outreach email example, and external case-study link.
- Worksheet with 14 text areas:
  - `interest`
  - `field`
  - `phenomenon`
  - `sources`
  - `expertPatterns`
  - `unknowns`
  - `questions`
  - `toyModel`
  - `data`
  - `limitations`
  - `mentors`
  - `feedback`
  - `nextAction`
  - `output`
- Worksheet persistence behavior:
  - Initial state reads and parses `localStorage["research-starter-worksheet"]`.
  - Invalid stored JSON falls back to an empty worksheet.
  - Save progress serializes the complete form to the same key and shows a temporary saved state.
  - Entries are not automatically saved while typing.
  - Clear responses requires browser confirmation, clears React state, and removes the storage key.
  - Existing stored objects are merged over the current empty field schema, which allows newly introduced fields to receive defaults.
- Printable worksheet behavior through `window.print()` and dedicated print CSS that removes site chrome and action controls.
- External case-study link behavior: new tab with `target="_blank"` and `rel="noopener noreferrer"`.
- No current use of `navigator`; direct browser APIs are limited to `document.getElementById`, `window.scrollTo`, `window.setTimeout`, `window.confirm`, `window.print`, and `localStorage`.

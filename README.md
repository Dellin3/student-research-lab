# Research Starter Lab

A practical pathway from curiosity to a real student research project.

Research Starter Lab is an independent educational website for high school students. It guides students through choosing a direction, reviewing literature, using AI responsibly, forming questions, building toy models, finding public data, contacting mentors, revising work, and producing a meaningful final output.

## Pages

- Home
- Start Here
- Learn hub
- Tools hub
- Find a Direction
- Research Workflow
- AI & Literature
- Build a Project
- Outreach
- Investigation Planner
- Research Record (served at `/worksheet`)
- Case Studies

The core journey is Interest → Direction → Question → Investigation → Sources / Evidence → Revision → Communication. The Research Record is interactive, printable, and saved only in the student's browser. It supports structured plans, source and evidence logs, revision history, a local mentor brief, JSON backup/import, and Markdown export.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run check:seo
npm run check:prerender
npm run qa:release
```

The production build compiles the Vite client and then pre-renders every public route from the central route configuration. Each route receives its own static `index.html` with page content and metadata, then hydrates as the same React application in the browser.

`npm run qa:browser` runs the Playwright browser suite at desktop, tablet, and mobile viewports. `npm run qa:release` runs lint, build, SEO/prerender, regression checks, internal-link validation, accessibility, and browser QA.

Research drafts are never uploaded. JSON import validates a versioned local backup and requires an explicit merge or replace decision before changing the current record.

The site uses React, Vite, React Router, and React Helmet Async. Vercel serves the generated route directories directly.

## Core research hub

The homepage routes students into direction, question, and investigation tools. Guides, tools, and resources are the three main navigation items; the existing deep URLs and local Research Record remain available.

Add verified resource entries in `src/data/resources.js`. Each entry supplies its title, category, purpose, official URL, and source. Entries immediately appear in the resource search and type selector. Check dates and eligibility at the original program page rather than copying perishable application claims.

The site can be linked from a school's resources page using the existing public origin. It does not claim school affiliation. Research notes remain in the visitor's browser; do not change the existing origin when deploying an update intended to retain those notes.

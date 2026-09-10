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

## Two core paths

The two primary entries are **Start research** (`/start-here`) and **Mentors & programs** (`/resources`). The homepage gives each a direct action. The existing deep URLs remain available as supporting guides and tools.

The beginner page teaches four steps through one continuing worked example. Students can switch between environment, mathematics, and humanities. Step and example selections are encoded in the URL so they can be shared. `src/data/researchSteps.js` owns this content.

The resource page has three views: research programs, finding a mentor, and papers/data. Search and format filters are reflected in the URL. `src/data/resources.js` owns the program summaries, official faculty-directory links, and source tools. To add a program, supply `id`, `title`, `organization`, `fullName`, `subject`, `format`, `location`, `cost` (empty if unverified), `audience`, `description`, `note`, and `href`. Supported format filters are `Remote`, `In person`, and `Varies by project`. Recheck source facts and update `RESOURCE_CHECKED_DATE` when reviewing the catalog. Do not imply applications are open without a current check.

Notes show question, sources, and next action first. Ordinary edits save immediately on the same device. Existing detailed fields, logs, JSON backups, explicit merge/replace imports, Markdown export, and mentor briefs remain available. Imported records stay staged until the student explicitly saves them.

The warm palette is defined in `src/styles/tokens.css`; the two core paths are styled in `src/styles/research-hub.css` and `src/components/home/home.css`. Motion responds to navigation, example choices, and pointer/focus states; reduced-motion preferences disable it.

`node scripts/check-core-paths.mjs` checks all beginner example/step combinations and resource search/view combinations using server rendering. Existing data regression checks cover research drafts and backward compatibility. Live browser QA must be run separately; passing these scripts does not certify the visual layout.

The site can be linked from a school's resources page using the existing public origin. It does not claim school affiliation. A real school directory or approved teacher contacts can replace the general school-teacher guidance when supplied. No school system integration or site update has been performed. Keep the existing origin for a production update intended to retain students' browser notes; a preview URL has separate browser storage.

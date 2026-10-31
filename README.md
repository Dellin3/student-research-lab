# Research Starter Lab

Optional student accounts add one **My research** page for a question, progress, sources, and next step. Supabase provides authentication and a private per-user cloud record. Public guides and the 15-program directory still require no account. The sign-in page uses **Continue with Google** for both new and returning students; it does not ask for a website password. See [account setup](docs/accounts-setup.md).

Two student goals: start a small research project independently, or find a suitable research program.

- `/`: two main entry points and direct resource links.
- `/start-here`: four steps and three switchable worked examples (environment, mathematics, humanities). `?example=mathematics` links straight to one.
- `/resources`: 15 programs with search, subject, eligibility, and format filters; a saved list ("Save to my list") that stays in the browser and can be shared as `/resources?programs=id,id`; 17 free research websites grouped as papers, data, citizen science, and citations; and two researcher directories.
- `/guides/research-without-a-mentor`: a practical, source-linked independent first project, with a copyable feedback-note template.
- `/guides/read-your-first-paper`: a source-linked reading exercise and a copyable six-part paper note.
- `/my-research`: character counters, clickable links and DOIs from Sources, copy all text, a dated entry button, and Ctrl/⌘+S saving.
- `/worksheet`: unindexed recovery of previously saved browser notes; no new notebook workflow.

The former guides and multi-step tools redirect to the relevant main page. Their source and data utilities are retained for compatibility; they are not imported by the active application.

## Run

Use `npm ci`, then `npm run dev`. `npm run build` generates discovery files and prerenders all five public pages plus the unindexed account, progress, feedback, and note recovery routes. `npm run qa:release` checks the two primary journeys, guides, source links, metadata, redirects, saved-data compatibility, and the student tools (`npm run check:tools`). `npm run qa:tools` runs the browser tests for filters, saved lists, worked examples, templates, and the My research editor against a mocked account, so no real Supabase data is touched. Historical tool-specific scripts (including `qa:r1`–`qa:r3`) are retained for their data utilities and are not current product acceptance gates.

## Canonical domain and discovery

The canonical production origin is `https://researchstarterlab.com`. Set `VITE_PUBLIC_SITE_URL=https://researchstarterlab.com` at build time; the code fallback uses the same origin. It must be an HTTPS origin with no path, query, or fragment. This is a public URL, not a secret. `src/config/site.js` is the single origin source for browser metadata and prerendering; `npm run discovery` generates `robots.txt`, both sitemaps, and `llms.txt` from that origin and the active public routes. Build-time `.env.production` values are also honored. Add new guides to `src/data/guides.js`, mount their page in the app, and add an explicit Vercel static rewrite. Keep account/progress/feedback/recovery routes noindex and outside the public sitemap. A domain change also needs hosting setup and permanent redirects; changing this variable alone does not configure DNS or migrate existing local browser notes.

## Update programs

Edit `src/data/resources.js`. Each program must include an official program URL, eligibility-source URL, exact citizenship/school/residence conditions, a source-cycle label, and `fields` (one or more of `mathematics`, `sciences`, `engineering`, `social-humanities`, taken from its official subject description). Preserve distinctions between research internships, directed research courses, and open collaborations. Recheck official eligibility before updating `RESOURCE_CHECKED_DATE`; never infer a new application cycle from older requirements.

Free research websites live in `RESOURCES` in the same file. Each needs a `group` from `RESOURCE_GROUPS`, a description that follows the site's own account of its scope, a short subject hint, a link label (`action`), and an HTTPS link.

## Saved work

No old browser-storage keys are deleted or modified by this version. The saved program list uses its own key, `rsl.savedPrograms.v1`, and holds only public program ids. Note recovery exports exact raw values from all five previous record/draft keys. Storage remains specific to the original browser and website origin. The recovery footer link is shown only when previous data exists.

## Deployment

Vercel publishes `main` to https://researchstarterlab.com through its GitHub integration, with previews for feature branches. `vercel.json` redirects public pages on the previous production alias `student-research-lab-theta.vercel.app` to their matching custom-domain URLs and rewrites prerendered pages. The old account, progress, feedback, and previous-note recovery URLs stay available without indexing, so existing sessions and browser-local notes are not moved across origins. See `docs/GEO_SETUP.md` for the required hosting and authentication configuration.

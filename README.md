# Research Starter Lab

Optional student accounts add one **My research** page for a question, progress, sources, and next step. Supabase provides authentication and a private per-user cloud record. Public guides and the 15-program directory still require no account. The sign-in page uses **Continue with Google** for both new and returning students; it does not ask for a website password. See [account setup](docs/accounts-setup.md).

Two student goals: start a small research project independently, or find a suitable research program.

- `/`: two main entry points and direct resource links.
- `/start-here`: four steps and one worked example.
- `/resources`: 15 programs, eligibility/format/search filters, papers/data links, and two researcher directories.
- `/guides/research-without-a-mentor`: a practical, source-linked independent first project.
- `/guides/read-your-first-paper`: a source-linked reading exercise and evidence note.
- `/worksheet`: unindexed recovery of previously saved browser notes; no new notebook workflow.

The former guides and multi-step tools redirect to the relevant main page. Their source and data utilities are retained for compatibility; they are not imported by the active application.

## Run

Use `npm ci`, then `npm run dev`. `npm run build` generates discovery files and prerenders all five public pages plus the unindexed account, progress, feedback, and note recovery routes. `npm run qa:release` checks the two primary journeys, guides, source links, metadata, redirects, and saved-data compatibility. Historical tool-specific scripts are retained for their data utilities and are not current product acceptance gates.

## Canonical domain and discovery

The canonical production origin is `https://researchstarterlab.com`. Set `VITE_PUBLIC_SITE_URL=https://researchstarterlab.com` at build time; the code fallback uses the same origin. It must be an HTTPS origin with no path, query, or fragment. This is a public URL, not a secret. `src/config/site.js` is the single origin source for browser metadata and prerendering; `npm run discovery` generates `robots.txt`, both sitemaps, and `llms.txt` from that origin and the active public routes. Build-time `.env.production` values are also honored. Add new guides to `src/data/guides.js`, mount their page in the app, and add an explicit Vercel static rewrite. Keep account/progress/feedback/recovery routes noindex and outside the public sitemap. A domain change also needs hosting setup and permanent redirects; changing this variable alone does not configure DNS or migrate existing local browser notes.

## Update programs

Edit `src/data/resources.js`. Each program must include an official program URL, eligibility-source URL, exact citizenship/school/residence conditions, and a source-cycle label. Preserve distinctions between research internships, directed research courses, and open collaborations. Recheck official eligibility before updating `RESOURCE_CHECKED_DATE`; never infer a new application cycle from older requirements.

## Saved work

No old browser-storage keys are deleted or modified by this version. Note recovery exports exact raw values from all five previous record/draft keys. Storage remains specific to the original browser and website origin. The recovery footer link is shown only when previous data exists.

## Deployment

Vercel publishes `main` to https://researchstarterlab.com through its GitHub integration, with previews for feature branches. `vercel.json` redirects public pages on the previous production alias `student-research-lab-theta.vercel.app` to their matching custom-domain URLs and rewrites prerendered pages. The old account, progress, feedback, and previous-note recovery URLs stay available without indexing, so existing sessions and browser-local notes are not moved across origins. See `docs/GEO_SETUP.md` for the required hosting and authentication configuration.

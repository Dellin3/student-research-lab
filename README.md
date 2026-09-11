# Research Starter Lab

Two student goals: start a small research project independently, or find a suitable research program.

- `/`: two main entry points and direct resource links.
- `/start-here`: four steps and one worked example.
- `/resources`: 15 programs, eligibility/format/search filters, papers/data links, and two researcher directories.
- `/worksheet`: unindexed recovery of previously saved browser notes; no new notebook workflow.

The former guides and multi-step tools redirect to the relevant main page. Their source and data utilities are retained for compatibility; they are not imported by the active application.

## Run

Use `npm ci`, then `npm run dev`. `npm run build` creates the client and prerenders the three public pages plus note recovery. `npm run qa:release` checks the current three-page experience, source links, metadata, redirects, and saved-data compatibility. Historical tool-specific scripts are retained for their data utilities and are not current product acceptance gates.

## Update programs

Edit `src/data/resources.js`. Each program must include an official program URL, eligibility-source URL, exact citizenship/school/residence conditions, and a source-cycle label. Preserve distinctions between research internships, directed research courses, and open collaborations. Recheck official eligibility before updating `RESOURCE_CHECKED_DATE`; never infer a new application cycle from older requirements.

## Saved work

No old browser-storage keys are deleted or modified by this version. Note recovery exports exact raw values from all five previous record/draft keys. Storage remains specific to the original browser and website origin. The recovery footer link is shown only when previous data exists.

## Deployment

Vercel publishes the existing preview branch through its GitHub integration. Production origin remains https://student-research-lab-theta.vercel.app. `vercel.json` contains explicit redirects for old routes and rewrites for prerendered pages.

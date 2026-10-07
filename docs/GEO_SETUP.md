# Public research content and discovery

The two primary journeys remain `/start-here` and `/resources`. The public sitemap also contains `/`, `/guides/research-without-a-mentor`, and `/guides/read-your-first-paper`. Guides have visible direct answers, constructed examples, source links, update dates, and matching Article/LearningResource and breadcrumb data. All public content is prerendered and readable without an account. Account, research progress, feedback, and previous-note recovery remain unindexed and outside the sitemap.

## Build and verify

Run `npm ci`, then `npm run qa:release`, `npm run check:indexnow`, and `npm run lint`. The SEO workflow runs these checks without credentials or deployment. `npm run build` regenerates robots.txt, XML/text sitemaps, and llms.txt from the active routes and canonical origin. It then builds the client and renders each public or explicitly prerendered route to its own HTML file.

## Configure the permanent domain

When a domain is purchased and connected to this Vercel project, set the public build variable `VITE_PUBLIC_SITE_URL=https://your-domain.example`. Use only an HTTPS origin. Rebuild and deploy; the variable updates initial HTML metadata, client metadata, JSON-LD URLs, robots, both sitemaps, and llms.txt together. Do not hand-edit separate copies of these generated files.

For a future Codex update: configure the purchased domain in hosting and DNS, retain one canonical domain, add permanent redirects from the old Vercel alias and alternate domain spelling, and preserve all valid paths. Verify redirects with HTTP requests, including a guide and `/resources`; verify the final page returns 200 with its own canonical, visible body, and working internal links. Check that account callback URLs support the new domain. Do not upload old browser notes automatically; browser-local notes belong to their original origin.

Search Console and Bing Webmaster property verification, sitemap submission, and URL inspection require the owner’s verified property/account. If that access is unavailable, describe the exact remaining steps rather than claiming submission or indexing. Submit the canonical `/sitemap.xml`, inspect key public URLs, and retain a baseline before assessing discovery changes.

## Notify participating search engines with IndexNow

The repository includes a root UTF-8 IndexNow verification file. It is a public ownership token, not an account credential. After deployment, run `npm run seo:submit -- --dry-run` to verify the live sitemap and exact live key contents without sending a notification. Run `npm run seo:submit` once to notify `https://api.indexnow.org/indexnow` of the configured public URLs. The command rejects private routes, mismatched origins, stale live sitemaps, incorrect key responses, and non-success HTTP responses. It never submits during builds or CI.

IndexNow receipt means the participating service received the URLs; HTTP 202 can mean key verification is pending. It does not guarantee indexing, ranking, Google coverage, traffic, or AI citations. Protocol reference: https://www.indexnow.org/documentation.

## Add or maintain content

Add substantive guide metadata and sources to `src/data/guides.js`, provide its visible page content, mount the route, and add the explicit static rewrite in `vercel.json`. Link it from a relevant existing page. Keep schema statements consistent with visible evidence. Maintain the real update date and distinguish worked examples from measured project results. Check current official program requirements before changing directory source dates or application-cycle claims. Do not add fabricated authors, reviews, usage numbers, or outcomes.

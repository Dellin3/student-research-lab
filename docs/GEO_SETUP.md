# Public research content and discovery

The two primary journeys remain `/start-here` and `/resources`. The public sitemap also contains `/`, `/guides/research-without-a-mentor`, and `/guides/read-your-first-paper`. Guides have visible direct answers, constructed examples, source links, update dates, and matching Article/LearningResource and breadcrumb data. All public content is prerendered and readable without an account. Account, research progress, feedback, and previous-note recovery remain unindexed and outside the sitemap.

## Build and verify

Run `npm ci`, then `npm run qa:release`, `npm run check:feedback`, `npm run check:indexnow`, and `npm run lint`. The SEO workflow runs these checks without credentials or deployment. Feedback tests use an in-memory store and mocked notifications, verifying both canonical and previous production origins without sending mail. `npm run build` regenerates robots.txt, XML/text sitemaps, and llms.txt from the active routes and canonical origin. It then builds the client and renders each public or explicitly prerendered route to its own HTML file.

## Permanent domain

The selected canonical origin is `https://researchstarterlab.com`, matching the code fallback. Connect the apex domain to the existing `student-research-lab` Vercel project, retain its GitHub `main` production branch, and set the production public build variable `VITE_PUBLIC_SITE_URL=https://researchstarterlab.com`. Set the same public origin for previews when checking production canonical metadata. Use only an HTTPS origin. Rebuild and deploy; the variable updates initial HTML metadata, client metadata, JSON-LD URLs, robots, both sitemaps, and llms.txt together. Do not hand-edit separate copies of these generated files.

`vercel.json` sends public pages on `student-research-lab-theta.vercel.app` to matching custom-domain paths with permanent 308 redirects. Exact host matching leaves previews outside those rules. Query strings pass through unchanged. The homepage redirect skips authentication/recovery query parameters so a pending PKCE callback can finish on its original origin. `/account`, `/my-research`, `/feedback`, `/worksheet`, API endpoints, and static assets remain accessible on the old host. Do not replace these rules with a blanket domain redirect: browser sessions, code verifiers, and old local notes belong to their original origin. Never automatically upload browser notes.

Connect `www.researchstarterlab.com` as an alternate project domain and redirect it permanently to the apex domain, preserving paths and queries. Before release, confirm the live DNS, certificate, and HTTPS responses; domain registration alone does not connect the project. Check `/resources?ref=domain-check` and a nested guide on the old host for a 308 to the exact canonical path/query, the destination for a 200 and matching canonical, and old `/account?code=synthetic-check` plus `/worksheet` for no cross-origin redirect. Synthetic callback values must not be real credentials.

Before offering sign-in on the new domain, configure Supabase project's `poosoenwocirlebxwzla` Auth URL settings: Site URL `https://researchstarterlab.com`, exact redirect URL `https://researchstarterlab.com/account`, and recovery return `https://researchstarterlab.com/account?mode=recovery`. Preserve the existing old-host and approved preview callbacks for in-flight links. Add `https://researchstarterlab.com` to the existing Google Web OAuth client's authorized JavaScript origins; its provider callback remains `https://poosoenwocirlebxwzla.supabase.co/auth/v1/callback`. See `docs/accounts-setup.md`. These dashboard settings and a real sign-in round trip require separate verification; passing builds does not prove them configured.

Search Console and Bing Webmaster property verification, sitemap submission, and URL inspection require the owner’s verified property/account. If that access is unavailable, describe the exact remaining steps rather than claiming submission or indexing. Submit the canonical `/sitemap.xml`, inspect key public URLs, and retain a baseline before assessing discovery changes.

For a later domain migration, configure hosting, DNS, Auth allowlists, and build origin together. Preserve each public page's path and protect origin-bound private/browser-local routes. References: https://vercel.com/docs/routing/redirects, https://vercel.com/docs/project-configuration/vercel-json#redirects, https://supabase.com/docs/guides/auth/redirect-urls, https://supabase.com/docs/guides/auth/sessions/pkce-flow.

## Notify participating search engines with IndexNow

The repository includes a root UTF-8 IndexNow verification file. It is a public ownership token, not an account credential. After deployment, run `npm run seo:submit -- --dry-run` to verify the live sitemap and exact live key contents without sending a notification. Run `npm run seo:submit` once to notify `https://api.indexnow.org/indexnow` of the configured public URLs. The command rejects private routes, mismatched origins, stale live sitemaps, incorrect key responses, and non-success HTTP responses. It never submits during builds or CI.

IndexNow receipt means the participating service received the URLs; HTTP 202 can mean key verification is pending. It does not guarantee indexing, ranking, Google coverage, traffic, or AI citations. Protocol reference: https://www.indexnow.org/documentation.

## Add or maintain content

Add substantive guide metadata and sources to `src/data/guides.js`, provide its visible page content, mount the route, and add the explicit static rewrite in `vercel.json`. Link it from a relevant existing page. Keep schema statements consistent with visible evidence. Maintain the real update date and distinguish worked examples from measured project results. Check current official program requirements before changing directory source dates or application-cycle claims. Do not add fabricated authors, reviews, usage numbers, or outcomes.

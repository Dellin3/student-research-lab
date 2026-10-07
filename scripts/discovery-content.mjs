import { PUBLIC_ROUTES } from '../src/config/routes.js'
import { SITE, absoluteUrl } from './site-config.mjs'
import { GUIDES } from '../src/data/guides.js'

function escapeXml(value) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') }

export function discoveryFiles() {
  const routes = PUBLIC_ROUTES.filter(route => route.sitemap && !route.noindex)
  const urls = routes.map(route => absoluteUrl(route.path))
  return {
    'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`,
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`,
    'sitemap.txt': `${urls.join('\n')}\n`,
    'llms.txt': `# ${SITE.name}\n\n${SITE.defaultDescription}\n\nAn independent student resource. Public guides and the program directory can be read without an account. This site does not certify novelty, feasibility, safety, or publishability and does not guarantee admission or research outcomes.\n\n## Public pages\n- Home: ${absoluteUrl('/')}\n- Start on your own: ${absoluteUrl('/start-here')} — four practical steps and a clearly labeled constructed example.\n- Find a program and resources: ${absoluteUrl('/resources')} — official-source eligibility summaries, papers, public data, and researcher directories.\n${GUIDES.map(guide => `- ${guide.heading}: ${absoluteUrl(guide.path)} — ${guide.description}`).join('\n')}\n\n## Scope and sources\nThe guides provide introductory teaching material. Constructed examples are labeled WORKED EXAMPLE and do not assert measured results. Each guide links its supporting sources and states its update date. AI-generated claims and citations should be checked against original evidence.\n\nProgram entries distinguish international nationality, U.S. residence, school attendance, citizenship, and permanent residency. Each names the official source and the cycle used. The directory does not imply applications are open. Check official program pages for current requirements, dates, and fees.\n\n## Private work\nMy research is a private account workspace, not a public research archive. Account, research progress, feedback, and legacy-note recovery pages are not recommended as public citation sources and are excluded from the sitemap. Reading a guide does not upload research text.\n`,
  }
}

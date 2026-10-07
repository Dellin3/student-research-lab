import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLIC_ROUTES } from '../src/config/routes.js'
import { absoluteUrl, SITE, DEFAULT_SITE_ORIGIN, normalizeSiteOrigin } from './site-config.mjs'
import { discoveryFiles } from './discovery-content.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const staleOrigin = ['https://student-research-lab', '.vercel.app'].join('')
const textExtensions = new Set(['.css', '.html', '.js', '.jsx', '.json', '.md', '.txt', '.xml'])
const errors = []

function collectTextFiles(path) {
  if (!statSync(path).isDirectory()) {
    return [path]
  }

  return readdirSync(path).flatMap((entry) => {
    const child = join(path, entry)

    if (statSync(child).isDirectory()) {
      return collectTextFiles(child)
    }

    return textExtensions.has(extname(child)) ? [child] : []
  })
}

function reportIf(condition, message) {
  if (condition) {
    errors.push(message)
  }
}

let origin
try {
  origin = new URL(SITE.origin)
  reportIf(origin.protocol !== 'https:', 'SITE.origin must use HTTPS.')
  reportIf(origin.pathname !== '/', 'SITE.origin must not contain a path.')
} catch {
  errors.push('SITE.origin must be a valid absolute URL.')
}

const paths = PUBLIC_ROUTES.map((route) => route.path)
reportIf(new Set(paths).size !== paths.length, 'Route config contains duplicate paths.')

const sitemapRoutes = PUBLIC_ROUTES.filter((route) => route.sitemap)
for (const route of sitemapRoutes) {
  reportIf(!route.title?.trim(), `Sitemap route ${route.path} is missing a title.`)
  reportIf(!route.description?.trim(), `Sitemap route ${route.path} is missing a description.`)
  reportIf(route.noindex, `Sitemap route ${route.path} must not be noindex.`)
}

for (const value of ['http://example.org', 'https://user:secret@example.org', 'https://example.org/path', 'https://example.org?preview=1', 'https://example.org/#fragment']) {
  let rejected = false
  try { normalizeSiteOrigin(value) } catch { rejected = true }
  reportIf(!rejected, 'Canonical origin validation accepted a non-origin value.')
}
reportIf(normalizeSiteOrigin('https://example.org/') !== 'https://example.org', 'Canonical origins must normalize trailing slashes.')

for (const [name, expected] of Object.entries(discoveryFiles())) {
  reportIf(readFileSync(join(root, 'public', name), 'utf8') !== expected, `${name} is out of sync; run npm run discovery.`)
  reportIf(readFileSync(join(root, 'dist', name), 'utf8') !== expected, `Built ${name} is out of sync; run npm run build.`)
}

const scanTargets = [
  join(root, 'public'),
  join(root, 'src'),
  join(root, 'index.html'),
  join(root, 'README.md'),
]
for (const file of scanTargets.flatMap(collectTextFiles)) {
  const content = readFileSync(file, 'utf8')
  reportIf(content.includes(staleOrigin), `Stale production domain found in ${file}.`)
}

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8')
const fallbackCanonicals = [
  ...indexHtml.matchAll(/<link[\s\S]*?rel="canonical"[\s\S]*?href="([^"]+)"[\s\S]*?>/g),
].map((match) => match[1])
reportIf(
  fallbackCanonicals.length !== 1 || fallbackCanonicals[0] !== `${DEFAULT_SITE_ORIGIN}/`,
  'index.html fallback must contain exactly one default homepage canonical; production metadata is prerendered from SITE.origin.',
)

const sitemapPath = join(root, 'public', 'sitemap.xml')
const sitemap = readFileSync(sitemapPath, 'utf8')
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const expectedUrls = sitemapRoutes.map((route) => absoluteUrl(route.path))

reportIf(new Set(sitemapUrls).size !== sitemapUrls.length, 'sitemap.xml contains duplicate URLs.')
reportIf(sitemap.includes(staleOrigin), 'sitemap.xml contains the stale production domain.')
for (const url of expectedUrls) {
  reportIf(!sitemapUrls.includes(url), `sitemap.xml is missing ${url}.`)
}
for (const url of sitemapUrls) {
  reportIf(!expectedUrls.includes(url), `sitemap.xml contains unexpected URL ${url}.`)
}

const sitemapText = readFileSync(join(root, 'public', 'sitemap.txt'), 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
reportIf(
  JSON.stringify(sitemapText) !== JSON.stringify(expectedUrls),
  'sitemap.txt must contain the same ordered URLs as sitemap.xml.',
)

const canonicalSitemap = absoluteUrl('/sitemap.xml')
const robots = readFileSync(join(root, 'public', 'robots.txt'), 'utf8')
reportIf(
  !robots.includes(`Sitemap: ${canonicalSitemap}`),
  `robots.txt must point to ${canonicalSitemap}.`,
)

if (errors.length > 0) {
  console.error('SEO validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exitCode = 1
} else {
  console.log(`SEO validation passed for ${sitemapRoutes.length} public routes.`)
}

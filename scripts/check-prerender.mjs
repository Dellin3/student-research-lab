import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLIC_ROUTES } from '../src/config/routes.js'
import { absoluteUrl } from '../src/config/site.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = join(root, 'dist')
const staleOrigin = ['https://student-research-lab', '.vercel.app'].join('')
const routes = PUBLIC_ROUTES.filter((route) => route.sitemap)
const errors = []

function outputPath(pathname) {
  if (pathname === '/') {
    return join(distDirectory, 'index.html')
  }

  return join(distDirectory, pathname.replace(/^\/+|\/+$/g, ''), 'index.html')
}

function decodeHtml(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))
  return decodeHtml(match?.[1])
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(
    (match) => match[0],
  )
}

const destinations = routes.map((route) => outputPath(route.path))
if (new Set(destinations).size !== destinations.length) {
  errors.push('Public routes resolve to duplicate output paths.')
}

const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))
for (const route of routes.filter((route) => route.path !== '/')) {
  const expectedDestination = `${route.path}/index.html`
  const hasRewrite = vercel.rewrites?.some(
    (rewrite) =>
      rewrite.source === route.path &&
      rewrite.destination === expectedDestination,
  )

  if (!hasRewrite) {
    errors.push(
      `${route.path}: vercel.json must rewrite to ${expectedDestination}.`,
    )
  }
}

for (const route of routes) {
  const file = outputPath(route.path)
  const label = route.path

  if (!existsSync(file)) {
    errors.push(`${label}: generated HTML is missing at ${file}.`)
    continue
  }

  const html = readFileSync(file, 'utf8')
  const headHtml = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || ''
  const titleMatches = [
    ...headHtml.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi),
  ].map((match) => decodeHtml(match[1].trim()))
  const descriptionTags = tags(headHtml, 'meta').filter(
    (tag) => attribute(tag, 'name') === 'description',
  )
  const robotsTags = tags(headHtml, 'meta').filter(
    (tag) => attribute(tag, 'name') === 'robots',
  )
  const canonicalTags = tags(headHtml, 'link').filter(
    (tag) => attribute(tag, 'rel') === 'canonical',
  )
  const openGraphUrls = tags(headHtml, 'meta').filter(
    (tag) => attribute(tag, 'property') === 'og:url',
  )
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
  const expectedCanonical = absoluteUrl(route.path)
  const rootStart = html.indexOf('<div id="root">')
  const bodyEnd = html.indexOf('</body>', rootStart)
  const rootHtml =
    rootStart >= 0 && bodyEnd > rootStart
      ? html.slice(rootStart, bodyEnd)
      : ''
  const visibleText = decodeHtml(
    rootHtml
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )

  if (titleMatches.length !== 1 || titleMatches[0] !== route.title) {
    errors.push(`${label}: expected exactly one route-specific title.`)
  }
  if (
    descriptionTags.length !== 1 ||
    attribute(descriptionTags[0], 'content') !== route.description
  ) {
    errors.push(`${label}: expected exactly one route-specific description.`)
  }
  if (
    canonicalTags.length !== 1 ||
    attribute(canonicalTags[0], 'href') !== expectedCanonical
  ) {
    errors.push(`${label}: canonical must be exactly ${expectedCanonical}.`)
  }
  if (
    robotsTags.length !== 1 ||
    attribute(robotsTags[0], 'content') !== 'index, follow'
  ) {
    errors.push(`${label}: expected one index, follow robots tag.`)
  }
  if (
    openGraphUrls.length !== 1 ||
    attribute(openGraphUrls[0], 'content') !== expectedCanonical
  ) {
    errors.push(`${label}: Open Graph URL must match the canonical URL.`)
  }
  if (h1Matches.length !== 1) {
    errors.push(`${label}: expected exactly one H1.`)
  }
  if (!rootHtml || /<div id="root">\s*<\/div>/.test(html)) {
    errors.push(`${label}: generated root is empty.`)
  }
  if (visibleText.length < 200) {
    errors.push(`${label}: generated root lacks meaningful visible text.`)
  }
  if (html.includes(staleOrigin)) {
    errors.push(`${label}: generated HTML contains the stale production domain.`)
  }
  if (html.includes('data-seo-fallback')) {
    errors.push(`${label}: fallback metadata was not replaced.`)
  }
}

if (errors.length > 0) {
  console.error('Prerender validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exitCode = 1
} else {
  console.log(`Prerender validation passed for ${routes.length} public routes.`)
}

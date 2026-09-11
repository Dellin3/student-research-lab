import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { PUBLIC_ROUTES, LEGACY_REDIRECTS } from '../src/config/routes.js'
import { PROGRAMS, MENTOR_DIRECTORIES, RESOURCES } from '../src/data/resources.js'
import { filterPrograms } from '../src/utils/programFinder.js'
import { collectSavedResearch, SAVED_RESEARCH_KEYS } from '../src/utils/savedResearch.js'

assert.equal(PUBLIC_ROUTES.filter(route => route.sitemap).length, 3, 'Only the three main pages should be indexed')
assert(PROGRAMS.length >= 15)
assert.equal(new Set(PROGRAMS.map(item => item.id)).size, PROGRAMS.length)
for (const item of PROGRAMS) {
  assert(item.eligibility && item.eligibilityLabel && item.cycle && item.audience)
  for (const key of ['href', 'eligibilityHref', 'admissionsHref']) if (item[key]) assert.equal(new URL(item[key]).protocol, 'https:')
}
assert.deepEqual(filterPrograms(PROGRAMS, { format: 'Remote' }).map(item => item.id), ['primes-usa', 'crowdmath'])
assert.deepEqual(filterPrograms(PROGRAMS, { q: 'PrImEs USA', format: 'Remote' }).map(item => item.id), ['primes-usa'])
assert.equal(filterPrograms(PROGRAMS, { eligibility: 'us-status' }).length, 4)
assert.equal(filterPrograms(PROGRAMS, { eligibility: 'us-school' }).length, 2)
assert.equal(filterPrograms(PROGRAMS, { eligibility: 'international' }).length, 9)
assert.equal(filterPrograms(PROGRAMS, { q: 'no-such-program-xyz' }).length, 0)
assert.equal(filterPrograms(PROGRAMS, { format: 'Remote', eligibility: 'us-status' }).length, 0)

// Recovery must preserve exact bytes without ever writing or deleting browser data.
const fixtures = Object.fromEntries(SAVED_RESEARCH_KEYS.map((key, index) => [key, index === 0 ? '{malformed old record' : JSON.stringify({ note: 'Original research ' + index, extra: ['keep', 'all'] })]))
const storage = { getItem: key => fixtures[key] ?? null, setItem: () => assert.fail('Recovery wrote storage'), removeItem: () => assert.fail('Recovery deleted storage') }
assert.deepEqual(collectSavedResearch(storage), fixtures)
assert.deepEqual(JSON.parse(JSON.stringify(collectSavedResearch(storage))), fixtures)
assert.deepEqual(collectSavedResearch({ getItem: () => null }), {})

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
  assert(vercel.redirects.some(item => item.source === from && item.destination === to && item.statusCode === 301))
  const destination = PUBLIC_ROUTES.find(route => route.path === to.split('#')[0])
  assert(destination?.sitemap, 'Legacy paths must resolve directly to a main page')
}
process.env.NODE_ENV = 'production'
const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
  const page = url => render(url).appHtml
  const countCards = html => (html.match(/class="opportunity-row"/g) || []).length
  const all = page('/resources')
  assert.equal(countCards(all), PROGRAMS.length)
  for (const item of PROGRAMS) {
    assert(all.includes('id="program-' + item.id + '"'))
    assert(all.includes(item.href.replaceAll('&', '&amp;')))
    assert(all.includes(item.eligibilityHref.replaceAll('&', '&amp;')))
  }
  for (const item of [...MENTOR_DIRECTORIES, ...RESOURCES]) assert(all.includes(item.href))
  for (const id of ['programs', 'sources', 'mentors']) assert(all.includes('id="' + id + '"'))
  assert.equal(countCards(page('/resources?eligibility=international')), 9)
  assert.equal(countCards(page('/resources?format=Remote')), 2)
  assert.equal(countCards(page('/resources?q=pRiMeS%20usa&format=Remote')), 1)
  assert.equal(countCards(page('/resources?format=Varies%20by%20project')), 3)
  assert.equal(countCards(page('/resources?eligibility=invalid&format=invalid')), 15)
  const empty = page('/resources?q=no-such-program-xyz')
  assert.equal(countCards(empty), 0)
  assert(empty.includes('Show all programs'))
  const start = page('/start-here')
  assert(start.includes('Make your question small.') && start.includes('Write down what changed.'))
  assert(start.includes('id="example"'))
  assert(!start.includes('<textarea') && !start.includes('Question Builder'))
  for (const path of ['/', '/start-here', '/resources']) {
    const html = page(path)
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    for (const oldPath of Object.keys(LEGACY_REDIRECTS)) assert(!html.includes('href="' + oldPath + '"'), 'A main page links to a removed workflow')
    assert(!html.includes('>My notes<'))
  }
  const recovery = render('/worksheet')
  assert(recovery.appHtml.includes('Download previous notes'))
  assert(!recovery.appHtml.includes('<textarea'))
  assert(recovery.headHtml.includes('noindex, follow'))
  console.log('Core checks passed: three-page journey, 15 sourced programs, filters and shared URLs, direct resource links, 11 redirects, and lossless note recovery.')
} finally { await vite.close() }

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { PUBLIC_ROUTES, LEGACY_REDIRECTS } from '../src/config/routes.js'
import { PROGRAMS, MENTOR_DIRECTORIES, RESOURCES, RESOURCE_GROUPS } from '../src/data/resources.js'
import { filterPrograms, parseProgramIds, SUBJECT_FILTERS } from '../src/utils/programFinder.js'
import { collectSavedResearch, SAVED_RESEARCH_KEYS } from '../src/utils/savedResearch.js'
import { GUIDES } from '../src/data/guides.js'
import { STARTER_EXAMPLES } from '../src/data/researchSteps.js'

assert.deepEqual(PUBLIC_ROUTES.filter(route => route.sitemap).map(route => route.path), ['/', '/start-here', '/resources', ...GUIDES.map(guide => guide.path)], 'Only the main pages and substantive guides should be indexed')
for (const route of PUBLIC_ROUTES.filter(route => route.noindex)) assert(!route.sitemap, 'Private and recovery pages must stay out of public sitemaps')
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

// Subject groups come from each program's official subject description.
const SUBJECTS = SUBJECT_FILTERS.slice(1).map(([value]) => value)
for (const item of PROGRAMS) assert(Array.isArray(item.fields) && item.fields.length && item.fields.every(field => SUBJECTS.includes(field)), `${item.id} needs at least one known subject group`)
assert.deepEqual(Object.fromEntries(SUBJECTS.map(subject => [subject, filterPrograms(PROGRAMS, { subject }).length])), { mathematics: 6, sciences: 12, engineering: 8, 'social-humanities': 3 })
assert.deepEqual(filterPrograms(PROGRAMS, { subject: 'mathematics', format: 'Remote' }).map(item => item.id), ['primes-usa', 'crowdmath'])
assert.deepEqual(filterPrograms(PROGRAMS, { q: 'laboratory project' }).map(item => item.id), ['garcia', 'bu-rise'], 'Search covers program descriptions')
assert.deepEqual(filterPrograms(PROGRAMS, { q: 'humanities' }).map(item => item.id), ['ucsc-sip', 'ucsb-rmp', 'ucsb-sra'])
assert.deepEqual(filterPrograms(PROGRAMS, { ids: ['crowdmath', 'rsi'] }).map(item => item.id), ['rsi', 'crowdmath'], 'Lists keep directory order')
assert.deepEqual(parseProgramIds('crowdmath, rsi,rsi,no-such-program,', PROGRAMS), ['crowdmath', 'rsi'])
assert.deepEqual(parseProgramIds(null, PROGRAMS), [])

// Free research websites are grouped, unique, and linked over HTTPS.
const groupIds = new Set(RESOURCE_GROUPS.map(group => group.id))
assert.equal(new Set(RESOURCES.map(item => item.id)).size, RESOURCES.length)
for (const item of RESOURCES) {
  assert(groupIds.has(item.group), `${item.id} needs a resource group`)
  assert(item.description && item.subjects && item.action, `${item.id} needs a description, subject hint, and link label`)
  assert.equal(new URL(item.href).protocol, 'https:')
}
for (const group of groupIds) assert(RESOURCES.some(item => item.group === group), `${group} has no websites`)

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
const vite = await createServer({ mode: 'production', appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
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
  assert.equal(countCards(page('/resources?subject=social-humanities')), 3)
  assert.equal(countCards(page('/resources?subject=invalid')), 15)
  const shared = page('/resources?programs=crowdmath,rsi,no-such-program')
  assert.equal(countCards(shared), 2)
  assert(shared.includes('Shared list.'))
  const emptyList = page('/resources?saved=1')
  assert.equal(countCards(emptyList), 0, 'A saved list lives only in the browser, never in static HTML')
  assert(emptyList.includes('Your list is empty.'))
  for (const group of RESOURCE_GROUPS) assert(all.includes(group.title))
  const start = page('/start-here')
  assert(start.includes('Make your question small.') && start.includes('Write down what changed.'))
  assert(start.includes('id="example"'))
  assert(start.includes(STARTER_EXAMPLES[0].heading) && start.includes('Worked example'))
  for (const example of STARTER_EXAMPLES) {
    assert(start.includes(`value="${example.id}"`), 'Every worked example can be chosen')
    const html = page(`/start-here?example=${example.id}`)
    assert(html.includes(example.heading) && html.includes(example.question), `${example.id} example renders directly`)
  }
  assert(!start.includes('<textarea') && !start.includes('Question Builder'))
  for (const guide of GUIDES) {
    assert(start.includes(`href="${guide.path}"`), 'Guide must be discoverable from the main research journey')
    const html = page(guide.path)
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    assert(!html.includes('<textarea') && !html.includes('type="password"'), 'Guides must be readable without a form or account')
    assert(html.includes('WORKED EXAMPLE') && html.includes('Sources and further reading'))
    assert(html.includes('class="copy-template-button"'), 'Each guide offers a note template')
  }
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
  console.log(`Core checks passed: two primary journeys, ${STARTER_EXAMPLES.length} worked examples, public guides, 15 sourced programs, subject and eligibility filters, shared lists, ${RESOURCES.length} research websites, 11 redirects, and lossless note recovery.`)
} finally { await vite.close() }

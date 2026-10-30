import assert from 'node:assert/strict'
import { addSavedIds, createSavedProgramsStore, parseSavedPrograms, SAVED_PROGRAMS_KEY, toggleSavedId } from '../src/lib/savedPrograms.js'
import { programListPath } from '../src/utils/programFinder.js'
import { appendDatedEntry, characterStatus, findSourceLinks, todayStamp } from '../src/utils/researchText.js'
import { SAVED_RESEARCH_KEYS } from '../src/utils/savedResearch.js'

function memoryStorage() {
  const data = new Map()
  return { getItem: key => data.has(key) ? data.get(key) : null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) }
}

// Saved programs: browser-only public ids, separate from legacy research notes.
assert(!SAVED_RESEARCH_KEYS.includes(SAVED_PROGRAMS_KEY), 'A saved program list must not be mistaken for previous research notes')
assert.deepEqual(parseSavedPrograms(null), [])
assert.deepEqual(parseSavedPrograms('{broken'), [])
assert.deepEqual(parseSavedPrograms(JSON.stringify({ schema: 2, ids: ['rsi'] })), [])
assert.deepEqual(parseSavedPrograms(JSON.stringify({ schema: 1, ids: ['rsi', 'rsi', 7, '', 'retired-program'] })), ['rsi', 'retired-program'], 'Unknown ids are kept, never silently deleted')
assert.deepEqual(toggleSavedId(['rsi'], 'rsi'), [])
assert.deepEqual(toggleSavedId(['rsi'], 'ssp'), ['rsi', 'ssp'])
assert.deepEqual(addSavedIds(['rsi'], ['ssp', 'rsi']), ['rsi', 'ssp'])

const storage = memoryStorage()
const store = createSavedProgramsStore(() => storage)
assert.equal(store.getSnapshot(), store.getSnapshot(), 'An unchanged list returns the same snapshot')
assert.equal(store.toggle('primes'), true)
assert.deepEqual(store.getSnapshot(), ['primes'])
assert.equal(JSON.parse(storage.getItem(SAVED_PROGRAMS_KEY)).schema, 1)
store.add(['crowdmath', 'primes'])
assert.deepEqual(store.getSnapshot(), ['primes', 'crowdmath'])
store.toggle('primes')
store.toggle('crowdmath')
assert.equal(storage.getItem(SAVED_PROGRAMS_KEY), null, 'An empty list removes its storage entry')

const blockedStorage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') }, removeItem() { throw new Error('blocked') } }
const blocked = createSavedProgramsStore(() => blockedStorage)
assert.deepEqual(blocked.getSnapshot(), [])
assert.equal(blocked.toggle('rsi'), false, 'Blocked storage is reported')
assert.deepEqual(blocked.getSnapshot(), ['rsi'], 'The list still works for this visit')
assert.equal(programListPath(['primes', 'crowdmath']), '/resources?programs=primes,crowdmath')

// Links and DOIs found in Sources & links.
const links = findSourceLinks('See https://en.wikipedia.org/wiki/Heat_(physics). Also (https://example.org/a/b), doi:10.1371/journal.pcbi.1008032; again https://example.org/a/b, javascript:alert(1), ftp://files.example.org.')
assert.deepEqual(links.map(link => link.href), ['https://en.wikipedia.org/wiki/Heat_(physics)', 'https://example.org/a/b', 'https://doi.org/10.1371/journal.pcbi.1008032'])
assert.deepEqual(links.map(link => link.label), ['en.wikipedia.org/wiki/Heat_(physics)', 'example.org/a/b', 'doi:10.1371/journal.pcbi.1008032'])
assert.deepEqual(findSourceLinks('https://doi.org/10.1000/xyz123').map(link => link.href), ['https://doi.org/10.1000/xyz123'], 'A DOI inside a link is listed once')
assert.deepEqual(findSourceLinks('http://localhost:3000/private'), [])
assert.equal(findSourceLinks('no links here').length, 0)
assert.equal(findSourceLinks(Array.from({ length: 30 }, (_, index) => `https://example.org/${index}`).join(' ')).length, 20)

// Dated entries never duplicate today's line.
assert.equal(todayStamp(new Date(2026, 0, 5)), '2026-01-05')
assert.equal(appendDatedEntry('', '2026-10-29'), '2026-10-29\n')
assert.equal(appendDatedEntry('Notes', '2026-10-29'), 'Notes\n\n2026-10-29\n')
assert.equal(appendDatedEntry('Notes\n', '2026-10-29'), 'Notes\n\n2026-10-29\n')
assert.equal(appendDatedEntry('Notes\n\n', '2026-10-29'), 'Notes\n\n2026-10-29\n')
assert.equal(appendDatedEntry('Notes\n\n2026-10-29\n', '2026-10-29'), 'Notes\n\n2026-10-29\n')
assert.equal(appendDatedEntry('Notes\n\n2026-10-29', '2026-10-29'), 'Notes\n\n2026-10-29\n')

// Character counters warn before a field is full.
assert.deepEqual(characterStatus(12, 2000), { level: 'ok', text: '12 / 2,000 characters' })
assert.deepEqual(characterStatus(1850, 2000), { level: 'near', text: '1,850 / 2,000 characters · 150 left' })
assert.deepEqual(characterStatus(2000, 2000), { level: 'full', text: '2,000 / 2,000 characters · limit reached' })

console.log('Student tool checks passed: saved and shared program lists, source links and DOIs, dated entries, and character counters.')

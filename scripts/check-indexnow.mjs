import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { indexNowPayload, submitIndexNow } from './submit-indexnow.mjs'
import { absoluteUrl } from './site-config.mjs'

const sitemap = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8')
const key = 'a'.repeat(32)
const payload = indexNowPayload(sitemap, key)
assert.throws(() => indexNowPayload(sitemap.replace('</urlset>', `<url><loc>${absoluteUrl('/my-research')}</loc></url></urlset>`), key), /public indexable routes/)
assert.throws(() => indexNowPayload(sitemap.replace(payload.urlList[0], 'https://other.example/'), key), /public indexable routes/)
assert.throws(() => indexNowPayload(sitemap, 'bad-key'), /verification key/)
let posts = 0
const mockFetch = (status = 202, validKey = true) => async (url, options) => {
  if (url.endsWith('/sitemap.xml')) return new Response(sitemap)
  if (url.endsWith(`/${key}.txt`)) return new Response(validKey ? key : `${key}\n`)
  posts++
  assert.equal(url, 'https://api.indexnow.org/indexnow')
  assert.equal(options.method, 'POST')
  assert.deepEqual(JSON.parse(options.body), payload)
  return new Response('', { status })
}
assert.equal((await submitIndexNow({ sitemap, key, dryRun: true, fetchImpl: mockFetch() })).status, 'dry-run')
assert.equal(posts, 0)
await assert.rejects(submitIndexNow({ sitemap, key, fetchImpl: mockFetch(202, false) }), /exactly the expected/)
assert.equal(posts, 0)
assert.equal((await submitIndexNow({ sitemap, key, fetchImpl: mockFetch() })).status, 202)
assert.equal(posts, 1)
await assert.rejects(submitIndexNow({ sitemap, key, fetchImpl: mockFetch(403) }), /HTTP 403/)
assert.equal(posts, 2)
console.log('IndexNow checks passed: public-route scope, live key, dry run, single notification, and HTTP error handling. No network requests sent.')

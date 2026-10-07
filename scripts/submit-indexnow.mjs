import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { PUBLIC_ROUTES } from '../src/config/routes.js'
import { SITE, absoluteUrl } from './site-config.mjs'

export function indexNowPayload(sitemap, key) {
  if (!/^[a-f0-9]{32}$/.test(key)) throw new Error('IndexNow requires the configured 32-character verification key.')
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'))
  const expected = PUBLIC_ROUTES.filter(route => route.sitemap && !route.noindex).map(route => absoluteUrl(route.path))
  if (!urlList.length || urlList.length > 10000 || new Set(urlList).size !== urlList.length) throw new Error('Sitemap must contain 1–10,000 unique public URLs.')
  if (urlList.length !== expected.length || urlList.some(url => !expected.includes(url))) throw new Error('Sitemap URLs must match only the configured public indexable routes.')
  if (urlList.some(value => { const url = new URL(value); return url.origin !== SITE.origin || url.search || url.hash || url.username || url.password })) throw new Error('IndexNow URLs must be canonical URLs on the configured origin.')
  return { host: new URL(SITE.origin).host, key, keyLocation: absoluteUrl(`/${key}.txt`), urlList }
}

export async function submitIndexNow({ sitemap, key, dryRun = false, fetchImpl = fetch }) {
  const payload = indexNowPayload(sitemap, key)
  const request = url => fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(20000) })
  const liveSitemap = await request(absoluteUrl('/sitemap.xml'))
  if (liveSitemap.status !== 200) throw new Error(`Live sitemap returned HTTP ${liveSitemap.status}; deploy before submitting.`)
  const livePayload = indexNowPayload(await liveSitemap.text(), key)
  if (JSON.stringify(livePayload.urlList) !== JSON.stringify(payload.urlList)) throw new Error('Live sitemap differs from the built sitemap; deploy the current build first.')
  const verification = await request(payload.keyLocation)
  if (verification.status !== 200 || await verification.text() !== key) throw new Error('Live IndexNow key file must return HTTP 200 with exactly the expected UTF-8 key.')
  if (dryRun) return { status: 'dry-run', count: payload.urlList.length }
  const response = await fetchImpl('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(payload), redirect: 'error', signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`IndexNow submission failed with HTTP ${response.status}.`)
  return { status: response.status, count: payload.urlList.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const directory = fileURLToPath(new URL('../public/', import.meta.url))
    const keys = readdirSync(directory).filter(name => /^[a-f0-9]{32}\.txt$/.test(name))
    if (keys.length !== 1) throw new Error('Exactly one public IndexNow verification file is required.')
    const key = readFileSync(`${directory}${keys[0]}`, 'utf8')
    if (`${key}.txt` !== keys[0]) throw new Error('IndexNow verification filename and contents disagree.')
    const sitemap = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8')
    const result = await submitIndexNow({ sitemap, key, dryRun: process.argv.includes('--dry-run') })
    console.log(result.status === 'dry-run' ? `Validated ${result.count} live public URLs and the verification file; no notification sent.` : `IndexNow received ${result.count} public URLs (HTTP ${result.status}). Receipt is not an indexing, ranking, traffic, or AI-citation guarantee.`)
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}

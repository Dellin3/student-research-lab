import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { RESEARCH_STEPS, STARTER_EXAMPLES } from '../src/data/researchSteps.js'
import { PROGRAMS, MENTOR_DIRECTORIES, RESOURCES } from '../src/data/resources.js'

process.env.NODE_ENV = 'production'
const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
  const page = url => render(url).appHtml
  const text = html => html.replace(/<[^>]*>/g, ' ').replaceAll('&#x27;', "'").replaceAll('&amp;', '&').replaceAll('&quot;', '"').replace(/\s+/g, ' ').trim()
  for (const example of STARTER_EXAMPLES) {
    for (const [index, step] of RESEARCH_STEPS.entries()) {
      const html = page(`/start-here?example=${example.id}&step=${step.id}`)
      assert(text(html).includes(step.title), `Missing step: ${step.id}`)
      assert(text(html).includes(example.steps[index][1]), `Wrong worked example: ${example.id}/${step.id}`)
      assert(html.includes(`value="${example.id}" selected=""`), 'Example selection should match the shared URL')
      assert.equal((html.match(/<h1\b/g) || []).length, 1)
    }
  }
  assert(text(page('/start-here?step=invalid&example=invalid')).includes(RESEARCH_STEPS[0].title), 'Invalid parameters need a usable default')
  for (const program of PROGRAMS) assert(text(page('/resources')).includes(program.title))
  const remote = page('/resources?format=Remote')
  assert(remote.includes('PRIMES-USA') && remote.includes('CrowdMath'), 'Remote filter must include both remote programs')
  assert(!remote.includes('Research Science Institute'), 'Remote filter includes an in-person program')
  assert(text(page('/resources?q=pRiMeS%20usa&format=Remote')).includes('1 opportunity'), 'Search should be case-insensitive and intersect the format filter')
  assert(text(page('/resources?q=zz-no-match')).includes('No matches yet.'), 'Empty search should be recoverable')
  const mentors = page('/resources?view=mentors')
  assert(text(mentors).includes('might be a teacher.'))
  for (const directory of MENTOR_DIRECTORIES) assert(mentors.includes(directory.href))
  const sources = page('/resources?view=sources')
  for (const resource of RESOURCES) assert(sources.includes(resource.href))
  assert(!sources.includes('Research Science Institute'))
  assert(text(page('/resources?view=invalid')).includes('Find a good fit.'))
  for (const item of [...PROGRAMS, ...MENTOR_DIRECTORIES, ...RESOURCES]) assert.equal(new URL(item.href).protocol, 'https:')
  console.log('Core-path checks passed: 12 worked-example steps, shared URLs, invalid parameters, program filtering, empty search, mentor directories, and sources.')
} finally {
  await vite.close()
}

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { createServer } from 'vite'
import { emptyProgress } from '../src/utils/progressDocument.js'

// This check uses deliberately created synthetic accounts. Never pass real
// student credentials. The private fixture file stays outside the repository.
const fixtureFile = process.argv[2]
if (!fixtureFile) throw new Error('Supply a private synthetic-fixture JSON path')
const fixtures = JSON.parse(readFileSync(fixtureFile, 'utf8'))
assert(fixtures.users.length === 2 && fixtures.users.every(user => user.email.endsWith('@example.invalid')))
const config = JSON.parse(readFileSync(new URL('../src/config/account.public.json', import.meta.url), 'utf8'))
assert.equal(fixtures.projectId, config.projectId)
const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
const clients = []
try {
  const { createProgressRepository } = await vite.ssrLoadModule('/src/lib/progressRepository.js')
  async function login(user) {
    const client = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
    clients.push(client)
    const { data, error } = await client.auth.signInWithPassword({ email: user.email, password: user.password })
    if (error) throw new Error(`Synthetic sign-in failed: ${error.code || error.status}`)
    assert.equal(data.session.user.id, user.id)
    return client
  }
  const [clientA, clientB] = await Promise.all(fixtures.users.map(login))
  const repoA = createProgressRepository(clientA, fixtures.users[0].id)
  const repoB = createProgressRepository(clientB, fixtures.users[1].id)
  const initial = await repoA.load()
  const doc = { ...emptyProgress(), question: 'Synthetic test: does cloud saving persist?', progress: 'Controlled test record; no student data.' }
  const first = await repoA.save(doc, initial.revision)
  assert.equal((await repoB.load()).revision, 0)
  const foreignRead = await clientB.from('research_progress').select('doc').eq('user_id', fixtures.users[0].id)
  assert(!foreignRead.error); assert.deepEqual(foreignRead.data, [])
  const directWrite = await clientB.from('research_progress').insert({ user_id: fixtures.users[1].id, doc })
  assert.equal(directWrite.error?.code, '42501')
  const writes = await Promise.allSettled([repoA.save({ ...doc, progress: 'Concurrent A' }, first.revision), repoA.save({ ...doc, progress: 'Concurrent B' }, first.revision)])
  assert.equal(writes.filter(result => result.status === 'fulfilled').length, 1)
  assert.equal(writes.find(result => result.status === 'rejected').reason.kind, 'conflict')
  const newest = await repoA.load()
  const clientOnNewDevice = await login(fixtures.users[0])
  const restored = await createProgressRepository(clientOnNewDevice, fixtures.users[0].id).load()
  assert.deepEqual(restored.doc, newest.doc)
  const refreshed = await clientA.auth.refreshSession()
  assert(!refreshed.error); assert.deepEqual((await repoA.load()).doc, newest.doc)
  await clientA.auth.signOut({ scope: 'local' })
  await assert.rejects(repoA.save(doc, newest.revision), error => error.kind === 'auth')
  const wrongIdentity = createProgressRepository(clientB, fixtures.users[0].id)
  await assert.rejects(wrongIdentity.save(doc, newest.revision), error => error.kind === 'auth')
  assert.equal((await repoB.load()).revision, 0)
  console.log('Live account checks passed: real sign-in, cloud save, another-device restore, refresh, two-user isolation, direct-write rejection, simultaneous-save conflict, and signed-out/session-switch denial.')
} finally {
  await Promise.allSettled(clients.map(client => client.auth.signOut({ scope: 'local' })))
  await Promise.allSettled(clients.map(client => client.auth.dispose()))
  await vite.close()
}

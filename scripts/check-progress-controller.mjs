import assert from 'node:assert/strict'
import { createProgressController } from '../src/lib/progressController.js'
import { createDraftStore, emptyProgress, sameProgress, validProgress } from '../src/utils/progressDocument.js'
import { nextAuthState } from '../src/account/authState.js'

function memoryStorage() {
  const values = new Map()
  return { get length() { return values.size }, key: index => [...values.keys()][index], getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
}
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
const doc = question => ({ ...emptyProgress(), question })
const row = (question, revision) => ({ doc: doc(question), revision, updated_at: new Date().toISOString() })
function fixture(initial = row('', 0)) {
  let cloud = structuredClone(initial), calls = 0
  const storage = memoryStorage()
  const drafts = createDraftStore(storage, 'user-a', 'editor-1')
  const repository = {
    load: async () => structuredClone(cloud),
    async save(value, revision) {
      calls++
      if (revision !== cloud.revision) throw Object.assign(new Error('conflict'), { kind: 'conflict' })
      cloud = { doc: structuredClone(value), revision: revision + 1, updated_at: new Date().toISOString() }
      return structuredClone(cloud)
    },
  }
  return { repository, drafts, storage, controller: createProgressController(repository, drafts, { delay: 60000 }), get cloud() { return cloud }, set cloud(value) { cloud = value }, get calls() { return calls } }
}

// Basic saves, exact content restoration, and no unintended initial writes.
{
  const f = fixture(); await f.controller.start(); assert.equal(f.calls, 0)
  f.controller.edit('question', 'A focused question'); assert(f.controller.getSnapshot().dirty)
  assert.equal(await f.controller.flush(), true); assert.equal(f.cloud.doc.question, 'A focused question')
  assert.equal(f.controller.getSnapshot().phase, 'saved'); assert.equal(f.storage.length, 0)
  f.controller.close()
}
// Keystrokes during a slow save must be serialized and eventually saved.
{
  const f = fixture(); const gate = deferred(); const original = f.repository.save; let first = true
  f.repository.save = async (...args) => { if (first) { first = false; await gate.promise } return original(...args) }
  await f.controller.start(); f.controller.edit('question', 'Earlier'); const saving = f.controller.flush()
  f.controller.edit('question', 'Latest'); const drain = f.controller.flush(); gate.resolve(); await saving; await drain
  assert.equal(f.cloud.doc.question, 'Latest'); assert.equal(f.cloud.revision, 2); assert(!f.controller.getSnapshot().dirty); f.controller.close()
}
// Regression: cloud A -> pending B -> revert A -> close must not lose A.
{
  const f = fixture(row('A', 1)); const gate = deferred(); const original = f.repository.save; let first = true
  f.repository.save = async (...args) => { if (first) { first = false; await gate.promise } return original(...args) }
  await f.controller.start(); f.controller.edit('question', 'B'); const saving = f.controller.flush()
  f.controller.edit('question', 'A'); assert(f.controller.getSnapshot().dirty); assert.equal(f.storage.length, 1)
  f.controller.close(); gate.resolve(); await saving; await f.controller.flush()
  assert.equal(f.cloud.doc.question, 'A'); assert.equal(f.cloud.revision, 3)
}
// Failure retains an exact per-user recovery copy and retry really saves it.
{
  const f = fixture(); const original = f.repository.save
  f.repository.save = async () => { throw new Error('offline') }
  await f.controller.start(); f.controller.edit('question', 'Offline notes'); assert.equal(await f.controller.flush(), false)
  assert.equal(f.controller.getSnapshot().phase, 'error'); assert.equal(f.storage.length, 1)
  const other = createDraftStore(f.storage, 'user-b', 'editor-2'); assert.equal(other.list().length, 0)
  const restored = createDraftStore(f.storage, 'user-a', 'editor-2').list(); assert.equal(restored[0].doc.question, 'Offline notes')
  f.repository.save = original; await f.controller.retry(); assert.equal(f.cloud.doc.question, 'Offline notes'); f.controller.close()
}
// A successful write with a lost response is recognized on retry.
{
  const f = fixture(); const original = f.repository.save; let first = true
  f.repository.save = async (...args) => { const result = await original(...args); if (first) { first = false; throw new Error('response lost') } return result }
  await f.controller.start(); f.controller.edit('question', 'Already committed'); await f.controller.flush(); assert(f.controller.getSnapshot().dirty)
  assert.equal(await f.controller.retry(), true); assert.equal(f.controller.getSnapshot().phase, 'saved'); assert.equal(f.cloud.revision, 1); f.controller.close()
}
// Real conflicts pause autosave until an explicit choice; a further remote edit
// is still checked when the user chooses to keep the draft.
{
  const f = fixture(row('Original', 1)); await f.controller.start(); f.controller.edit('question', 'Local edit'); f.cloud = row('Other device', 2)
  assert.equal(await f.controller.flush(), false); assert.equal(f.controller.getSnapshot().phase, 'conflict')
  f.controller.edit('progress', 'Further local detail'); assert.equal(f.controller.getSnapshot().phase, 'conflict')
  f.cloud = row('Third edit', 3); assert.equal(await f.controller.keepDraft(), false); assert.equal(f.cloud.doc.question, 'Third edit')
  assert.equal(await f.controller.keepDraft(), true); assert.equal(f.cloud.doc.question, 'Local edit'); assert.equal(f.cloud.doc.progress, 'Further local detail'); f.controller.close()
}
// Restoring an older device draft cannot silently overwrite the account copy.
{
  const f = fixture(row('Cloud', 3)); createDraftStore(f.storage, 'user-a', 'earlier-editor').save(doc('Recovered'), 1)
  await f.controller.start(); f.controller.restore(f.controller.getSnapshot().recovered[0]); assert.equal(f.controller.getSnapshot().phase, 'conflict'); assert.equal(f.calls, 0)
  f.controller.useCloud(); assert.equal(f.controller.getSnapshot().doc.question, 'Cloud'); assert(!f.controller.getSnapshot().dirty); f.controller.close()
}
// A failed initial load must not permit a blank overwrite.
{
  const f = fixture(row('Keep', 2)); const original = f.repository.load; f.repository.load = async () => { throw new Error('offline') }
  await f.controller.start(); f.controller.edit('question', 'Forbidden'); assert.equal(f.controller.getSnapshot().doc.question, ''); assert.equal(f.calls, 0)
  f.repository.load = original; await f.controller.retry(); assert.equal(f.controller.getSnapshot().doc.question, 'Keep'); f.controller.close()
}
// Storage quota failure still leaves a usable, accurately unsaved editor.
{
  const repository = { load: async () => row('', 0), save: async () => { throw new Error('offline') } }
  const controller = createProgressController(repository, { list: () => [], save() { throw new Error('quota') }, removeOwn() {} }, { delay: 60000 })
  await controller.start(); controller.edit('question', 'Keep in memory'); await controller.flush()
  assert.equal(controller.getSnapshot().doc.question, 'Keep in memory'); assert.equal(controller.getSnapshot().localBackup, false); assert(controller.getSnapshot().dirty); controller.close()
}
// Strict Mode setup/cleanup/setup shares the pending load safely.
{
  const f = fixture(); const gate = deferred(); f.repository.load = () => gate.promise
  const pending = f.controller.start(); f.controller.close(); const second = f.controller.start(); gate.resolve(row('Restored', 2)); await pending; await second
  assert.equal(f.controller.getSnapshot().doc.question, 'Restored'); f.controller.close()
}
// Recovery slots from separate tabs are independent; malformed slots stay intact.
{
  const storage = memoryStorage(); const a = createDraftStore(storage, 'a', 'tab1'); const b = createDraftStore(storage, 'a', 'tab2')
  a.save(doc('tab 1'), 1); b.save(doc('tab 2'), 1); a.removeOwn(); assert.equal(storage.length, 1); assert.equal(a.list()[0].doc.question, 'tab 2')
  storage.setItem('rsl.progress.v1:a:broken', '{bad'); assert.equal(a.list().length, 1); assert.equal(storage.getItem('rsl.progress.v1:a:broken'), '{bad')
}
// Auth recovery is tied to an identity, never just to the previous page state.
{
  const sessionA = { user: { id: 'a' } }, sessionB = { user: { id: 'b' } }
  const initial = { session: null, recovery: false }
  const recovery = nextAuthState(initial, 'PASSWORD_RECOVERY', sessionA, { client: {} })
  assert(recovery.recovery)
  assert(nextAuthState(recovery, 'TOKEN_REFRESHED', sessionA, { client: {} }).recovery)
  assert(!nextAuthState(recovery, 'SIGNED_IN', sessionB, { client: {} }).recovery)
  assert(!nextAuthState(recovery, 'PASSWORD_RECOVERY', sessionA, { client: {}, callbackError: 'Invalid link' }).recovery)
  assert.equal(nextAuthState(initial, 'SIGNED_IN', sessionA, { client: {}, initializing: true }).status, 'loading')
}
assert(validProgress(emptyProgress())); assert(!validProgress({ ...emptyProgress(), question: '\u0000' })); assert(sameProgress(doc('a'), doc('a')))
console.log('Progress checks passed: serialized autosave, reverted in-flight edits, retries, response loss, conflicts, recovery, isolation, quota errors, load failure, Strict Mode, and auth identity changes.')

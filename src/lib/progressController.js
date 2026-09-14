import { emptyProgress, sameProgress, validProgress } from '../utils/progressDocument.js'

export function createProgressController(repository, drafts, { delay = 900 } = {}) {
  let state = { doc: emptyProgress(), revision: 0, updatedAt: null, phase: 'loading', dirty: false, error: '', localBackup: true, recovered: [], cloudConflict: null }
  let cloudDoc = emptyProgress()
  let timer, inFlight, loadPromise, closed = false
  const listeners = new Set()
  const publish = patch => { state = { ...state, ...patch }; for (const listener of listeners) listener() }
  const backup = () => {
    try { drafts.save(state.doc, state.revision); if (!state.localBackup) publish({ localBackup: true }) }
    catch { publish({ localBackup: false }) }
  }
  const removeOwn = () => { try { drafts.removeOwn() } catch { /* Safe to retain a redundant recovery copy. */ } }
  const schedule = () => { clearTimeout(timer); if (!closed && state.dirty && !['conflict', 'error'].includes(state.phase)) timer = setTimeout(() => { void flush() }, delay) }
  const adoptSaved = row => {
    cloudDoc = { ...row.doc }
    const dirty = !sameProgress(state.doc, row.doc)
    publish({ revision: row.revision, updatedAt: row.updated_at, dirty, phase: dirty ? 'editing' : 'saved', error: '', cloudConflict: null })
    if (dirty) { backup(); schedule() } else removeOwn()
  }

  async function start() {
    closed = false
    if (loadPromise) return loadPromise
    publish({ phase: 'loading', error: '' })
    loadPromise = (async () => {
      try {
        const row = await repository.load()
        if (closed) return
        cloudDoc = { ...row.doc }
        let recovered = []
        try { recovered = drafts.list().filter(item => !sameProgress(item.doc, row.doc)) } catch { publish({ localBackup: false }) }
        publish({ doc: { ...row.doc }, revision: row.revision, updatedAt: row.updated_at, phase: row.revision ? 'saved' : 'ready', dirty: false, recovered })
      } catch { if (!closed) publish({ phase: 'load-error', error: 'Your saved research could not be loaded. Please retry before editing.' }) }
      finally { loadPromise = null }
    })()
    return loadPromise
  }

  function edit(key, value) {
    if (closed || ['loading', 'load-error'].includes(state.phase)) return
    const doc = { ...state.doc, [key]: value }
    if (!validProgress(doc)) return
    const dirty = !sameProgress(doc, cloudDoc) || !!inFlight
    publish({ doc, dirty, phase: state.phase === 'conflict' ? 'conflict' : state.phase === 'saving' ? 'saving' : dirty ? 'editing' : 'saved', error: '' })
    if (dirty) backup(); else removeOwn()
    schedule()
  }

  async function flush() {
    clearTimeout(timer)
    if (['loading', 'load-error', 'conflict'].includes(state.phase)) return false
    if (inFlight) { const ok = await inFlight; return ok && state.dirty ? flush() : ok }
    if (!state.dirty) return true
    const submitted = { ...state.doc }
    const revision = state.revision
    publish({ phase: 'saving', error: '' })
    inFlight = (async () => {
      try {
        const row = await repository.save(submitted, revision)
        adoptSaved(row)
        return true
      } catch (error) {
        if (error.kind === 'conflict') {
          try {
            const row = await repository.load()
            // A lost response may have hidden a successful save. Matching content
            // acknowledges that write without overwriting another device's work.
            if (sameProgress(row.doc, submitted)) { adoptSaved(row); return true }
            publish({ phase: 'conflict', cloudConflict: row, error: 'Another tab or device saved a newer version. Compare both copies before continuing.' })
          } catch { publish({ phase: 'error', error: 'We could not check the latest version. Your draft is still open. Retry when connected.' }) }
        } else {
          publish({ phase: 'error', error: error.kind === 'auth' ? 'Your session needs attention. Download your draft before signing in again.' : 'Your changes have not reached your account. Check your connection and retry.' })
        }
        backup()
        return false
      } finally { inFlight = null }
    })()
    return inFlight
  }

  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    start, edit, flush,
    async retry() { return state.phase === 'load-error' ? start() : flush() },
    restore(item) {
      if (closed || !validProgress(item.doc) || !['ready', 'saved'].includes(state.phase)) return
      publish({ doc: { ...item.doc }, dirty: !sameProgress(item.doc, cloudDoc), phase: 'editing', recovered: state.recovered.filter(draft => draft.key !== item.key) })
      // Preserve the original recovery slot, even if browser backup is unavailable.
      backup()
      if (item.revision !== state.revision) publish({ phase: 'conflict', cloudConflict: { doc: { ...cloudDoc }, revision: state.revision, updated_at: state.updatedAt }, error: 'This device draft and your account have different versions. Compare them before saving.' })
      else schedule()
    },
    useCloud() {
      if (!state.cloudConflict) return
      const row = state.cloudConflict
      publish({ doc: { ...row.doc } })
      adoptSaved(row)
    },
    keepDraft() {
      if (!state.cloudConflict) return
      const row = state.cloudConflict
      cloudDoc = { ...row.doc }
      publish({ revision: row.revision, updatedAt: row.updated_at, cloudConflict: null, phase: 'editing', dirty: !sameProgress(state.doc, row.doc), error: '' })
      backup()
      return flush()
    },
    close() {
      clearTimeout(timer)
      closed = true
      listeners.clear()
      // Navigation can happen before the debounce expires. Finish one pending
      // save while retaining the device copy if the request fails.
      if ((state.dirty || inFlight) && !['conflict', 'error'].includes(state.phase)) void flush()
    },
  }
}

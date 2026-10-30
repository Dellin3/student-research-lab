// A student's saved programs live only in this browser. The list holds public
// program ids, never research text, and it is not sent anywhere.
export const SAVED_PROGRAMS_KEY = 'rsl.savedPrograms.v1'
const EMPTY = Object.freeze([])
const MAX_SAVED = 100

export function parseSavedPrograms(raw) {
  if (typeof raw !== 'string') return EMPTY
  try {
    const data = JSON.parse(raw)
    if (!data || data.schema !== 1 || !Array.isArray(data.ids)) return EMPTY
    const ids = []
    for (const id of data.ids) {
      if (typeof id === 'string' && id && id.length <= 80 && !ids.includes(id)) ids.push(id)
      if (ids.length >= MAX_SAVED) break
    }
    return ids.length ? Object.freeze(ids) : EMPTY
  } catch { return EMPTY }
}

export function serializeSavedPrograms(ids) {
  return JSON.stringify({ schema: 1, ids: [...ids], savedAt: new Date().toISOString() })
}

export function toggleSavedId(ids, id) {
  return ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id].slice(-MAX_SAVED)
}

export function addSavedIds(ids, additions) {
  const next = [...ids]
  for (const id of additions) if (!next.includes(id)) next.push(id)
  return next.slice(-MAX_SAVED)
}

function browserStorage() {
  return window.localStorage
}

// If the browser refuses storage, the list still works until the page closes.
export function createSavedProgramsStore(getStorage = browserStorage) {
  const listeners = new Set()
  let cache = { raw: undefined, ids: EMPTY }
  let memory = null
  const emit = () => { for (const listener of listeners) listener() }

  function getSnapshot() {
    if (memory) return memory
    let raw
    try { raw = getStorage().getItem(SAVED_PROGRAMS_KEY) } catch { raw = null }
    if (raw !== cache.raw) cache = { raw, ids: parseSavedPrograms(raw) }
    return cache.ids
  }

  function write(ids) {
    const next = ids.length ? Object.freeze([...ids]) : EMPTY
    try {
      const storage = getStorage()
      if (next.length) storage.setItem(SAVED_PROGRAMS_KEY, serializeSavedPrograms(next))
      else storage.removeItem(SAVED_PROGRAMS_KEY)
      memory = null
      emit()
      return true
    } catch {
      memory = next
      emit()
      return false
    }
  }

  return {
    getSnapshot,
    getServerSnapshot: () => EMPTY,
    subscribe(listener) {
      listeners.add(listener)
      const onStorage = event => { if (event.key === null || event.key === SAVED_PROGRAMS_KEY) listener() }
      window.addEventListener('storage', onStorage)
      return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage) }
    },
    toggle: id => write(toggleSavedId(getSnapshot(), id)),
    add: ids => write(addSavedIds(getSnapshot(), ids)),
  }
}

export const savedPrograms = createSavedProgramsStore()

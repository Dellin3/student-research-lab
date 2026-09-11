export const PROGRESS_FIELDS = [
  { key: 'question', label: 'My research question', hint: 'What are you trying to understand?', limit: 2000, rows: 3 },
  { key: 'progress', label: 'Progress so far', hint: 'What did you try, find, or learn?', limit: 20000, rows: 7 },
  { key: 'sources', label: 'Sources & links', hint: 'Keep useful references and a note about why they help.', limit: 12000, rows: 4 },
  { key: 'nextStep', label: 'My next step', hint: 'One specific thing to do when you return.', limit: 4000, rows: 3 },
]
export const emptyProgress = () => Object.fromEntries(PROGRESS_FIELDS.map(({ key }) => [key, '']))
export function validProgress(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === PROGRESS_FIELDS.length
    && PROGRESS_FIELDS.every(({ key, limit }) => typeof value[key] === 'string' && value[key].length <= limit && !value[key].includes('\u0000'))
}
export function sameProgress(a, b) { return !!a && !!b && PROGRESS_FIELDS.every(({ key }) => a[key] === b[key]) }
export function progressText(doc) {
  return PROGRESS_FIELDS.map(({ key, label }) => `${label}\n${doc[key] || '(empty)'}`).join('\n\n') + '\n'
}

// Each open editor gets its own recovery slot. A second tab cannot overwrite it.
export function createDraftStore(storage, userId, editorId) {
  const prefix = `rsl.progress.v1:${userId}:`
  const ownKey = prefix + editorId
  return {
    save(doc, revision) {
      storage.setItem(ownKey, JSON.stringify({ schema: 1, userId, doc, revision, savedAt: new Date().toISOString() }))
    },
    removeOwn() { storage.removeItem(ownKey) },
    remove(key) { if (key.startsWith(prefix)) storage.removeItem(key) },
    list() {
      const items = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (!key?.startsWith(prefix) || key === ownKey) continue
        try {
          const item = JSON.parse(storage.getItem(key))
          if (item.schema === 1 && item.userId === userId && validProgress(item.doc) && Number.isSafeInteger(item.revision) && item.revision >= 0) items.push({ ...item, key })
        } catch { /* Keep unreadable records untouched. */ }
      }
      return items.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
    },
  }
}

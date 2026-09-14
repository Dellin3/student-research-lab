import { emptyProgress, validProgress } from '../utils/progressDocument.js'
import { accountConfig } from './accountClient.js'

function validateRow(row, userId) {
  if (!row) return { doc: emptyProgress(), revision: 0, updated_at: null }
  if (row.user_id !== userId || !validProgress(row.doc) || !Number.isSafeInteger(row.revision) || row.revision < 1) throw new Error('invalid_response')
  return row
}
async function timedQuery(url, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) {
      const error = data
      const failure = new Error(error.code === 'PT409' ? 'conflict' : 'request_failed')
      failure.kind = error.code === 'PT409' ? 'conflict' : ['PGRST301', 'PGRST303', '42501'].includes(error.code) ? 'auth' : 'network'
      throw failure
    }
    return data
  } finally { clearTimeout(timeout) }
}
export function createProgressRepository(client, userId) {
  const config = accountConfig()
  async function request(path, body) {
    const { data, error } = await client.auth.getSession()
    if (error || !data.session || data.session.user.id !== userId) {
      const failure = new Error('session_changed'); failure.kind = 'auth'; throw failure
    }
    // Capture a token for this editor's user before the request. A later account
    // change cannot send this user's pending text as another user's draft.
    return timedQuery(`${config.url}/rest/v1/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { apikey: config.key, Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  }
  return {
    async load() {
      const rows = await request(`research_progress?select=user_id,doc,revision,updated_at&user_id=eq.${encodeURIComponent(userId)}&limit=1`)
      if (!Array.isArray(rows)) throw new Error('invalid_response')
      return validateRow(rows[0], userId)
    },
    async save(doc, revision) {
      if (!validProgress(doc)) throw new Error('invalid_document')
      const row = await request('rpc/save_research_progress', { p_doc: doc, p_expected_revision: revision })
      return validateRow(row, userId)
    },
  }
}

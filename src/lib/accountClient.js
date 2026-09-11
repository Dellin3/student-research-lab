import publicConfig from '../config/account.public.json'
let clientPromise
export const emailDeliveryReady = () => import.meta.env.VITE_ACCOUNT_EMAIL_READY === 'true' || publicConfig.emailReady === true

async function authFetch(input, init = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (init.signal?.aborted) abort()
  else init.signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(abort, 20000)
  try { return await fetch(input, { ...init, signal: controller.signal }) }
  finally { clearTimeout(timeout); init.signal?.removeEventListener('abort', abort) }
}

export function accountConfig() {
  const url = (import.meta.env.VITE_SUPABASE_URL || publicConfig.url)?.trim()
  const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || publicConfig.publishableKey)?.trim()
  if (!url || !key) return null
  try {
    if (new URL(url).protocol !== 'https:') return null
    // Never accept a privileged key in a browser build.
    if (key.startsWith('sb_secret_')) return null
    if (!key.startsWith('sb_publishable_')) return null
    return { url, key }
  } catch { return null }
}

export function getAccountClient() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  const config = accountConfig()
  if (!config) return Promise.resolve(null)
  if (!clientPromise) clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(config.url, config.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', skipAutoInitialize: true },
    global: { fetch: authFetch },
  })).catch(error => { clientPromise = undefined; throw error })
  return clientPromise
}

export async function updateRecoveryPassword(client, expectedUserId, password) {
  const config = accountConfig()
  const { data, error } = await client.auth.getSession()
  if (error || data.session?.user.id !== expectedUserId) throw new Error('session_changed')
  const response = await authFetch(`${config.url}/auth/v1/user`, {
    method: 'PUT', headers: { apikey: config.key, Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  })
  if (!response.ok) {
    const result = await response.json()
    throw { code: result.code, status: response.status }
  }
}

export function authMessage(error) {
  if (error?.code === 'invalid_credentials') return 'The email or password is incorrect.'
  if (error?.code === 'email_not_confirmed') return 'Confirm your email before signing in. You can request another confirmation below.'
  if (error?.code === 'weak_password') return 'Choose a longer password that you do not use on other websites.'
  if (error?.status === 429 || /rate_limit/.test(error?.code || '')) return 'Too many attempts. Please wait a few minutes before trying again.'
  if (error?.code === 'same_password') return 'Choose a password different from your previous password.'
  return 'We could not complete this request. Check your connection and try again.'
}

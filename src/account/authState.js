export function nextAuthState(current, event, session, { client, initializing = false, callbackError = '' }) {
  const sameUser = !!session && current.session?.user.id === session.user.id
  return {
    client, session,
    status: initializing ? 'loading' : session ? 'signed-in' : 'signed-out',
    error: callbackError,
    recovery: !callbackError && !!session && (event === 'PASSWORD_RECOVERY' || (sameUser && current.recovery && event !== 'SIGNED_OUT')),
  }
}

// Supabase may return to the Site URL root when an exact redirect is not allowed.
// Wait for the one SDK exchange, then route locally without copying credentials.
export function rootAuthReturnPath({ pathname, search = '', hash = '' }, status) {
  if (pathname !== '/' || status === 'loading') return null
  const query = new URLSearchParams(search)
  const fragment = new URLSearchParams(hash.slice(1))
  const callback = query.has('code') || ['error', 'error_code', 'error_description'].some(key => query.has(key) || fragment.has(key))
  if (!callback) return null
  return query.get('mode') === 'recovery' ? '/account?mode=recovery' : '/account'
}

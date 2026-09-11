export function nextAuthState(current, event, session, { client, initializing = false, callbackError = '' }) {
  const sameUser = !!session && current.session?.user.id === session.user.id
  return {
    client, session,
    status: initializing ? 'loading' : session ? 'signed-in' : 'signed-out',
    error: callbackError,
    recovery: !callbackError && !!session && (event === 'PASSWORD_RECOVERY' || (sameUser && current.recovery && event !== 'SIGNED_OUT')),
  }
}

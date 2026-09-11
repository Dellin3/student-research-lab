import { useEffect, useState } from 'react'
import { AccountContext } from './AccountContext.js'
import { accountConfig, getAccountClient } from '../lib/accountClient.js'
import { nextAuthState } from './authState.js'

export default function AccountProvider({ children }) {
  const [account, setAccount] = useState({ status: accountConfig() ? 'loading' : 'unavailable', client: null, session: null, recovery: false, error: '' })
  useEffect(() => {
    if (!accountConfig()) return
    let active = true, subscription, initializing = true, authEvents = 0
    const url = new URL(window.location.href)
    const hadCode = url.searchParams.has('code')
    let callbackError = url.searchParams.has('error') || new URLSearchParams(url.hash.slice(1)).has('error') ? 'This email link could not be verified. Request a new one.' : ''
    const timeout = setTimeout(() => {
      if (active) setAccount(current => current.status === 'loading' ? { ...current, status: 'error', error: 'Sign-in is taking too long. Check your connection and reload.' } : current)
    }, 15000)
    getAccountClient().then(async client => {
      if (!active) return
      const result = client.auth.onAuthStateChange((event, session) => {
        if (!active) return
        authEvents++
        if (!initializing && event === 'SIGNED_IN') callbackError = ''
        // Keep this callback synchronous; auth methods can hold the session lock.
        setAccount(current => nextAuthState(current, event, session, { client, initializing, callbackError }))
      })
      subscription = result.data.subscription
      const initialization = await client.auth.initialize()
      if (initialization.error || (hadCode && new URL(window.location.href).searchParams.has('code'))) callbackError = 'This email link could not be verified. Request a new one and open it in the same browser.'
      initializing = false
      const beforeSessionRead = authEvents
      const { data, error } = await client.auth.getSession()
      if (active && authEvents === beforeSessionRead) setAccount(current => error ? { ...current, client, status: 'error', error: 'We could not restore your session. Reload to try again.' } : nextAuthState(current, 'INITIAL_SESSION', data.session, { client, callbackError }))
    }).catch(() => { if (active) setAccount(current => ({ ...current, status: 'error', error: 'Sign-in could not load. Check your connection and reload.' })) })
    return () => { active = false; clearTimeout(timeout); subscription?.unsubscribe() }
  }, [])
  const finishRecovery = () => setAccount(current => ({ ...current, recovery: false, error: '' }))
  return <AccountContext.Provider value={{ ...account, finishRecovery }}>{children}</AccountContext.Provider>
}

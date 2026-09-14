import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { useAccount } from '../account/AccountContext.js'
import { authMessage, getSignInOptions, updateRecoveryPassword } from '../lib/accountClient.js'

export default function AccountPage() {
  const account = useAccount()
  const navigate = useNavigate()
  const location = useLocation()
  const resetRoute = new URLSearchParams(location.search).get('mode') === 'recovery'
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState({ text: '', error: false })
  const [providers, setProviders] = useState({ status: 'loading', google: false })
  const [providerAttempt, setProviderAttempt] = useState(0)
  const recovery = account.recovery && !account.error
  const googleReady = providers.status === 'ready' && providers.google
  const title = recovery ? 'Set a new password.' : 'Pick up where you left off.'

  useEffect(() => {
    if (account.status === 'signed-in' && !account.recovery && !resetRoute && !account.error) navigate('/my-research', { replace: true })
  }, [account.status, account.recovery, account.error, resetRoute, navigate])

  useEffect(() => {
    const restore = event => { if (event.persisted) setBusy(false) }
    window.addEventListener('pageshow', restore)
    return () => window.removeEventListener('pageshow', restore)
  }, [])

  useEffect(() => {
    if (!account.client) return
    const controller = new AbortController()
    getSignInOptions({ signal: controller.signal }).then(options => {
      if (!controller.signal.aborted) setProviders({ status: 'ready', ...options })
    }).catch(() => {
      if (!controller.signal.aborted) setProviders({ status: 'error', google: false })
    })
    return () => controller.abort()
  }, [account.client, providerAttempt])

  async function signInWithGoogle() {
    if (!account.client || !googleReady || busy) return
    setBusy(true)
    setMessage({ text: '', error: false })
    try {
      const { error } = await account.client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/account`, queryParams: { prompt: 'select_account' } },
      })
      if (error) throw error
    } catch {
      setMessage({ text: 'Google sign-in could not open. Please try again.', error: true })
      setBusy(false)
    }
  }

  // Only an already-verified legacy recovery link may show a password form.
  async function submitRecovery(event) {
    event.preventDefault()
    if (!account.client || !recovery || !account.session || busy) return
    if (password !== repeat) { setMessage({ text: 'The passwords do not match.', error: true }); return }
    setBusy(true)
    setMessage({ text: '', error: false })
    try {
      await updateRecoveryPassword(account.client, account.session.user.id, password)
      setPassword(''); setRepeat(''); account.finishRecovery()
      navigate('/my-research', { replace: true })
    } catch (error) { setMessage({ text: authMessage(error), error: true }) }
    finally { setBusy(false) }
  }
  return <><RouteSeo path="/account" /><main id="main-content" className="account-page">
    <section className="account-card"><p className="eyebrow">Your research, continued</p><h1>{title}</h1>
      {account.status === 'unavailable' ? <><p>Account sign-in is not available yet. The research guide and program directory are ready to explore.</p><Link className="button primary" to="/start-here">Start on your own</Link></>
        : account.status === 'loading' ? <p role="status">Checking your session…</p>
        : account.status === 'error' ? <><p role="alert">{account.error}</p><button className="button primary" onClick={() => window.location.reload()}>Reload sign-in</button></>
        : <>
          {!recovery && <p>Save your question, progress, sources, and next step to your account.</p>}
          {recovery && <p>Set a new password for {account.session.user.email}.</p>}
          {!recovery && !resetRoute && <div className="account-providers">
            {providers.status === 'loading' && <p className="field-hint" role="status">Checking sign-in options…</p>}
            {providers.status === 'error' && <p className="account-message" role="status">We could not check whether Google sign-in is available. <button type="button" className="plain-action" disabled={busy} onClick={() => { setProviders({ status: 'loading', google: false }); setProviderAttempt(attempt => attempt + 1) }}>Try again</button></p>}
            {googleReady && <><button type="button" className="button primary account-google" disabled={busy} onClick={signInWithGoogle}>Continue with Google</button><p className="field-hint">Sign up or sign in with Google. No website password needed.</p></>}
            {!googleReady && providers.status === 'ready' && <p className="account-message" role="status">Google sign-in is currently unavailable. You can still explore the research guide and program directory.</p>}
          </div>}
          {account.error && <p className="account-message is-error" role="alert">{account.error}</p>}
          {resetRoute && !recovery && <><p>This reset link has not been verified.</p><Link className="resource-direct" to="/account">Return to Google sign-in</Link></>}
          {recovery && <form onSubmit={submitRecovery} className="account-form">
            <label>New password<input type="password" name="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /><span className="field-hint">Use at least 12 characters.</span></label>
            <label>Confirm password<input type="password" name="confirm-password" autoComplete="new-password" minLength={12} maxLength={128} required value={repeat} onChange={event => setRepeat(event.target.value)} disabled={busy} /></label>
            <button type="submit" className="button primary" disabled={busy}>{busy ? 'Please wait…' : 'Update password'}</button>
          </form>}
          {message.text && <p className={`account-message${message.error ? ' is-error' : ''}`} role={message.error ? 'alert' : 'status'}>{message.text}</p>}
          <details className="account-privacy"><summary>How your notes are stored</summary><p>Your email identifies your account. Research text is stored with Supabase and is not publicly visible. A recovery copy of unsaved changes may also remain in this browser. Site administrators can access stored data for operating the service. You can download your notes or clear their text from My research.</p></details>
        </>}
      <Link className="account-browse" to="/resources">Browse programs without an account →</Link>
    </section>
  </main></>
}

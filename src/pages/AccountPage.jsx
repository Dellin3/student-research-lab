import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { useAccount } from '../account/AccountContext.js'
import { authMessage, emailDeliveryReady, updateRecoveryPassword } from '../lib/accountClient.js'

export default function AccountPage() {
  const account = useAccount()
  const navigate = useNavigate()
  const location = useLocation()
  const resetRoute = new URLSearchParams(location.search).get('mode') === 'recovery'
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState({ text: '', error: false })
  const recovery = account.recovery && !account.error
  const emailReady = emailDeliveryReady()
  const signingIn = mode === 'sign-in' && !recovery
  const title = recovery ? 'Set a new password.' : mode === 'reset' ? 'Reset your password.' : mode === 'sign-up' ? 'Keep your research.' : 'Pick up where you left off.'

  useEffect(() => {
    if (account.status === 'signed-in' && !account.recovery && !resetRoute && !account.error) navigate('/my-research', { replace: true })
  }, [account.status, account.recovery, account.error, resetRoute, navigate])

  function changeMode(next) { setMode(next); setPassword(''); setRepeat(''); setMessage({ text: '', error: false }) }
  async function submit(event) {
    event.preventDefault()
    if (!account.client || busy) return
    if (!emailReady && !recovery && mode !== 'sign-in') { setMessage({ text: 'Email registration and recovery are not open yet.', error: true }); return }
    if ((recovery || mode === 'sign-up') && password !== repeat) { setMessage({ text: 'The passwords do not match.', error: true }); return }
    setBusy(true)
    setMessage({ text: '', error: false })
    const origin = window.location.origin
    try {
      if (recovery) {
        await updateRecoveryPassword(account.client, account.session.user.id, password)
        setPassword(''); setRepeat(''); account.finishRecovery()
        navigate('/my-research', { replace: true })
      } else if (mode === 'reset') {
        const { error } = await account.client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/account?mode=recovery` })
        if (error) throw error
        setMessage({ text: 'If this email has an account, a reset link is on its way. Open it in this same browser.', error: false })
      } else if (mode === 'sign-up') {
        const { data, error } = await account.client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${origin}/account` } })
        if (error) throw error
        setPassword(''); setRepeat('')
        if (data.session) navigate('/my-research', { replace: true })
        else setMessage({ text: 'Check your inbox to confirm your email. Open the link in this same browser, then sign in. If you already have an account, use Sign in below.', error: false })
      } else {
        const { error } = await account.client.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        setPassword(''); navigate('/my-research', { replace: true })
      }
    } catch (error) { setMessage({ text: authMessage(error), error: true }) }
    finally { setBusy(false) }
  }
  async function resend() {
    if (!emailReady) return
    if (!email.trim() || busy) { if (!email.trim()) setMessage({ text: 'Enter your email above first.', error: true }); return }
    setBusy(true)
    try {
      const { error } = await account.client.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/account` } })
      if (error) throw error
      setMessage({ text: 'If confirmation is needed for this address, a new link is on its way. Open it in this same browser.', error: false })
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
          {!emailReady && <p className="account-message" role="status">Existing accounts can sign in. New registration and email recovery will open when email delivery is ready.</p>}
          {account.error && <p className="account-message is-error" role="alert">{account.error}</p>}
          {resetRoute && !recovery ? <><p>This reset link has not been verified.{emailReady ? ' Request a fresh link and open it in the browser where you requested it.' : ''}</p><Link className="resource-direct" to="/account" onClick={() => changeMode(emailReady ? 'reset' : 'sign-in')}>{emailReady ? 'Request a password reset' : 'Return to sign in'}</Link></> : <form onSubmit={submit} className="account-form">
            {!recovery && <label>Email<input type="email" name="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} /></label>}
            {(recovery || mode !== 'reset') && <label>{recovery ? 'New password' : 'Password'}<input type="password" name="password" autoComplete={signingIn ? 'current-password' : 'new-password'} minLength={signingIn ? 1 : 12} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} />{!signingIn && <span className="field-hint">Use at least 12 characters.</span>}</label>}
            {(recovery || mode === 'sign-up') && <label>Confirm password<input type="password" name="confirm-password" autoComplete="new-password" minLength={12} maxLength={128} required value={repeat} onChange={event => setRepeat(event.target.value)} disabled={busy} /></label>}
            <button type="submit" className="button primary" disabled={busy}>{busy ? 'Please wait…' : recovery ? 'Update password' : mode === 'reset' ? 'Send reset link' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
          </form>}
          {message.text && <p className={`account-message${message.error ? ' is-error' : ''}`} role={message.error ? 'alert' : 'status'}>{message.text}</p>}
          {emailReady && !recovery && !resetRoute && <div className="account-options">{mode === 'sign-in' ? <><button type="button" disabled={busy} onClick={() => changeMode('sign-up')}>Create an account</button><button type="button" disabled={busy} onClick={() => changeMode('reset')}>Forgot password?</button></> : <button type="button" disabled={busy} onClick={() => changeMode('sign-in')}>Back to sign in</button>}{mode !== 'reset' && <button type="button" disabled={busy} onClick={resend}>Resend confirmation email</button>}</div>}
          <details className="account-privacy"><summary>How your notes are stored</summary><p>Your email identifies your account. Research text is stored with Supabase and is not publicly visible. A recovery copy of unsaved changes may also remain in this browser. Site administrators can access stored data for operating the service. You can download your notes or clear their text from My research.</p></details>
        </>}
      <Link className="account-browse" to="/resources">Browse programs without an account →</Link>
    </section>
  </main></>
}

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { useAccount } from '../account/AccountContext.js'
import { createProgressController } from '../lib/progressController.js'
import { createProgressRepository } from '../lib/progressRepository.js'
import { createDraftStore, emptyProgress, PROGRESS_FIELDS, progressText } from '../utils/progressDocument.js'

function downloadText(text, filename = 'my-research.txt') {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function safeStorage() {
  try { return window.localStorage } catch { return { get length() { throw new Error('unavailable') }, setItem() { throw new Error('unavailable') }, removeItem() { throw new Error('unavailable') } } }
}
function ResearchEditor({ client, user }) {
  const [signingOut, setSigningOut] = useState(false)
  const [actionError, setActionError] = useState('')
  const controller = useMemo(() => createProgressController(createProgressRepository(client, user.id), createDraftStore(safeStorage(), user.id, crypto.randomUUID())), [client, user.id])
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
  useEffect(() => {
    void controller.start()
    const beforeUnload = event => { if (controller.getSnapshot().dirty) { event.preventDefault(); event.returnValue = '' } }
    const reconnect = () => { if (['error', 'load-error'].includes(controller.getSnapshot().phase)) void controller.retry() }
    window.addEventListener('beforeunload', beforeUnload); window.addEventListener('online', reconnect)
    return () => { window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('online', reconnect); controller.close() }
  }, [controller])
  async function signOut() {
    setActionError(''); setSigningOut(true)
    try {
      if (!await controller.flush()) { setActionError('Your draft has not been saved to your account. Retry saving or download it before leaving.'); return }
      const { error } = await client.auth.signOut({ scope: 'local' })
      if (error) throw error
    } catch { setActionError('We could not sign you out. Please try again.') }
    finally { setSigningOut(false) }
  }
  function download(doc = state.doc, filename) {
    try { downloadText(progressText(doc), filename); setActionError('') }
    catch { setActionError('This browser could not create a download. Copy your text before leaving.') }
  }
  async function leaveWithBackup() {
    if (!window.confirm('Download this draft and sign out? It has not been saved to your account. A recovery copy may remain on this device.')) return
    try {
      downloadText(progressText(state.doc)); setSigningOut(true)
      const { error } = await client.auth.signOut({ scope: 'local' })
      if (error) throw error
    } catch { setActionError('The backup or sign-out could not finish. Keep this page open and try again.') }
    finally { setSigningOut(false) }
  }
  async function clearText() {
    if (!window.confirm('Clear all four fields from your account? Download a copy first if you want to keep this research.')) return
    for (const [key, value] of Object.entries(emptyProgress())) controller.edit(key, value)
    await controller.flush()
  }
  const disabled = ['loading', 'load-error'].includes(state.phase) || signingOut
  const status = { loading: 'Loading your research…', 'load-error': 'Could not load', ready: 'Ready for your first note', editing: 'Changes waiting to save', saving: 'Saving to your account…', saved: 'Saved to your account', error: 'Not saved to your account', conflict: 'Two versions need your review' }[state.phase]
  return <>
    <div className="research-account-line"><span>{user.email}</span><button className="plain-action" disabled={signingOut} onClick={signOut}>{signingOut ? 'Signing out…' : 'Sign out'}</button></div>
    <div className="research-toolbar"><p className={`save-state is-${state.phase}`} role="status" aria-live="polite">{status}{state.updatedAt && !state.dirty && <span> · {new Date(state.updatedAt).toLocaleString()}</span>}</p><div><button className="plain-action" onClick={() => download()} disabled={disabled}>Download a copy</button><button className="button primary" disabled={disabled || !state.dirty || state.phase === 'saving' || state.phase === 'conflict'} onClick={() => { void controller.flush() }}>Save now</button></div></div>
    {state.error && <div className="research-alert" role="alert"><p>{state.error}</p>{state.phase !== 'conflict' && <button className="button secondary" onClick={() => { void controller.retry() }}>Retry</button>}</div>}
    {!state.localBackup && <p className="research-alert" role="status">Device backup is unavailable in this browser. Keep this page open until your account save finishes, or download a copy.</p>}
    {actionError && <div className="research-alert" role="alert"><p>{actionError}</p>{state.dirty && <button className="plain-action" onClick={leaveWithBackup}>Download draft and sign out</button>}</div>}
    {state.recovered.length > 0 && <details className="recovered-drafts"><summary>{state.recovered.length} unsynced device {state.recovered.length === 1 ? 'draft' : 'drafts'}</summary><p>These copies have not been confirmed as saved to your account.</p>{state.recovered.map(item => <div key={item.key}><span>{new Date(item.savedAt).toLocaleString()}</span><button className="plain-action" disabled={state.dirty || disabled} onClick={() => controller.restore(item)}>Restore draft</button><button className="plain-action" onClick={() => download(item.doc, 'recovered-research.txt')}>Download</button></div>)}</details>}
    {state.cloudConflict && <section className="research-conflict" aria-labelledby="conflict-heading"><h2 id="conflict-heading">A newer account copy</h2><p>Your draft is still in the fields below. Review the account copy before choosing.</p><details><summary>Read the account copy</summary><dl>{PROGRESS_FIELDS.map(field => <div key={field.key}><dt>{field.label}</dt><dd>{state.cloudConflict.doc[field.key] || '(empty)'}</dd></div>)}</dl></details><div className="conflict-actions"><button className="button secondary" onClick={() => download(state.cloudConflict.doc, 'account-research-copy.txt')}>Download account copy</button><button className="button secondary" onClick={() => { if (window.confirm('Replace the fields below with the account copy? Download your current draft first if you want to keep it.')) controller.useCloud() }}>Use account copy</button><button className="button primary" onClick={() => { if (window.confirm('Save the draft below over this account copy? Another edit will still be checked before saving.')) void controller.keepDraft() }}>Keep my draft instead</button></div></section>}
    <form className="research-notes-form" onSubmit={event => { event.preventDefault(); void controller.flush() }}><fieldset disabled={disabled}><legend className="sr-only">Your research notes</legend>{PROGRESS_FIELDS.map(field => <label className="research-note-field" key={field.key}><span><strong>{field.label}</strong><span className="field-hint" id={`hint-${field.key}`}>{field.hint}</span></span><textarea name={field.key} rows={field.rows} maxLength={field.limit} value={state.doc[field.key]} onChange={event => controller.edit(field.key, event.target.value)} aria-describedby={`hint-${field.key}`} /></label>)}</fieldset></form>
    <div className="research-bottom"><p>Account saves are private to your login. Unsaved changes also keep a recovery copy on this device when browser storage is available.</p><button className="plain-action" disabled={disabled || state.phase === 'saving' || state.phase === 'conflict'} onClick={clearText}>Clear research text</button></div>
  </>
}
export default function MyResearchPage() {
  const account = useAccount()
  return <><RouteSeo path="/my-research" /><main id="main-content" className="my-research-page"><header className="research-title"><p className="eyebrow">My research</p><h1>A place to <em>continue.</em></h1><p>Your question, what you have learned, and one next step.</p></header>
    {account.status === 'signed-in' && !account.recovery ? <ResearchEditor key={account.session.user.id} client={account.client} user={account.session.user} />
      : <section className="research-signed-out">{account.status === 'loading' ? <p role="status">Checking your session…</p> : <><h2>{account.status === 'unavailable' ? 'Account saving is not available yet.' : account.recovery ? 'Finish resetting your password.' : 'Sign in to keep your progress.'}</h2><p>{account.status === 'unavailable' ? 'You can keep using the guide and research directory.' : 'Your research will be waiting when you return, including on another device.'}</p><Link className="button primary" to="/account">{account.recovery ? 'Set new password' : 'Go to sign in'}</Link></>}</section>}
  </main></>
}

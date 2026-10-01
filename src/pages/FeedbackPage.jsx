import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { contact, feedbackCategories, feedbackEmailBody, feedbackPagePath } from '../config/feedback.js'

export default function FeedbackPage() {
  const location = useLocation()
  const page = feedbackPagePath(new URLSearchParams(location.search).get('from'))
  const [fields, setFields] = useState({ category: '', message: '', name: '', email: '', website: '' })
  const [availability, setAvailability] = useState('checking')
  const [sending, setSending] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const attempt = useRef(null)
  const request = useRef(null)
  const messageField = useRef(null)
  const result = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    let active = true
    fetch('/api/feedback', { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Unavailable')
        const data = await response.json()
        if (active) setAvailability(data.enabled === true ? 'ready' : 'unavailable')
      })
      .catch(() => { if (active) setAvailability('unavailable') })
      .finally(() => clearTimeout(timeout))
    return () => { active = false; controller.abort(); clearTimeout(timeout) }
  }, [])

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => { if (receipt) result.current?.focus() }, [receipt])

  function change(event) {
    const { name, value } = event.target
    setFields(previous => ({ ...previous, [name]: value }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (sending || availability !== 'ready') return
    if (!fields.name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (fields.message.trim().length < 10) {
      setError('Please write at least 10 characters.')
      messageField.current?.focus()
      return
    }
    const payload = { ...fields, message: fields.message.trim(), name: fields.name.trim(), email: fields.email.trim(), page }
    const signature = JSON.stringify(payload)
    if (attempt.current?.signature !== signature) attempt.current = { signature, id: crypto.randomUUID() }
    const controller = new AbortController()
    request.current = controller
    const timeout = setTimeout(() => controller.abort(), 25000)
    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: attempt.current.id }), signal: controller.signal,
      })
      const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null
      if (!response.ok || data?.ok !== true || data?.saved !== true || typeof data.id !== 'string' || !data.id) {
        if (response.status === 429) throw new Error('Please wait a few minutes before trying again.')
        if (response.status === 400) throw new Error(data?.error || 'Please check your entries.')
        throw new Error('Your submission could not be confirmed. Your message is still here; please try again.')
      }
      setReceipt(data.id)
    } catch (failure) {
      setError(failure.name === 'AbortError'
        ? 'Your submission could not be confirmed in time. Your message is still here; please try again.'
        : failure.message)
    } finally { clearTimeout(timeout); request.current = null; setSending(false) }
  }

  const emailBody = feedbackEmailBody({ ...fields, page })
  const emailLink = `mailto:${contact.email}?subject=${encodeURIComponent('Research Starter Lab feedback')}&body=${encodeURIComponent(emailBody)}`

  return <><RouteSeo path="/feedback" /><main id="main-content" className="feedback-layout">
    <section className="feedback-panel" aria-labelledby="feedback-title">
      <h1 id="feedback-title">Feedback</h1>
      {receipt ? <div className="feedback-success" ref={result} tabIndex={-1} role="status"><p>Thank you. Your feedback has been saved.</p><Link className="feedback-submit" to="/">Home</Link></div> : <form className="feedback-form" onSubmit={submit} aria-label="Website feedback">
        <fieldset disabled={sending}>
          <legend className="sr-only">Your feedback</legend>
          <div className="feedback-personal">
            <label htmlFor="feedback-name">Your name<input id="feedback-name" name="name" autoComplete="name" maxLength={100} value={fields.name} onChange={change} required placeholder="Name" /></label>
            <label htmlFor="feedback-email">Your email<input id="feedback-email" name="email" type="email" autoComplete="email" maxLength={254} value={fields.email} onChange={change} required placeholder="you@example.com" /></label>
          </div>
          <label htmlFor="feedback-category">Problem type<select id="feedback-category" name="category" value={fields.category} onChange={change} required><option value="" disabled>Select a type</option>{feedbackCategories.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
          <label htmlFor="feedback-message">Your message<textarea ref={messageField} id="feedback-message" name="message" value={fields.message} onChange={change} required minLength={10} maxLength={5000} rows={4} placeholder="What would you like to ask or suggest?" /></label>
          <div className="feedback-honeypot" aria-hidden="true"><label htmlFor="feedback-website">Leave this field empty<input id="feedback-website" name="website" type="text" value={fields.website} onChange={change} tabIndex={-1} autoComplete="off" /></label></div>
        </fieldset>
        {error ? <p className="feedback-error" role="alert">{error}</p> : null}
        <p className="feedback-recipient">To: {contact.email}</p>
        {availability !== 'ready' ? <p className="feedback-status" role="status">{availability === 'checking' ? 'Checking submission availability…' : <>Direct submission is unavailable. <a href={emailLink}>Email this message</a>.</>}</p> : null}
        <button className="feedback-submit" type="submit" disabled={availability !== 'ready' || sending}>{sending ? 'Submitting…' : 'Submit feedback'}</button>
      </form>}
    </section>
  </main></>
}

import { useState } from 'react'

// Copies a plain-text note template. If the browser blocks the clipboard, the
// template appears so the student can select and copy it by hand.
export default function CopyTemplate({ label, text }) {
  const [status, setStatus] = useState('idle')
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch { setStatus('manual') }
  }
  return <div className="copy-template">
    <button type="button" className="copy-template-button" onClick={copy}>{label}</button>
    <p className="copy-template-status" role="status">{status === 'copied' ? 'Copied. Paste it into your notes or My research.' : status === 'manual' ? 'Your browser blocked copying. Select the template below instead.' : ''}</p>
    {status === 'manual' && <pre className="copy-template-text" tabIndex={0}>{text}</pre>}
  </div>
}

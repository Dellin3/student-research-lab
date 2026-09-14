import { useState } from 'react'
import { Link } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { collectSavedResearch } from '../utils/savedResearch.js'

export default function ResearchRecordPage() {
  const [status, setStatus] = useState('')
  function download() {
    try {
      const records = collectSavedResearch(window.localStorage)
      if (!Object.keys(records).length) { setStatus('No previous notes were found in this browser. Try the device and website address where you originally saved them.'); return }
      const file = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = 'research-notes-backup.json'
      link.click()
      URL.revokeObjectURL(url)
      setStatus('Backup downloaded. Your original notes remain in this browser.')
    } catch { setStatus('This browser could not access the saved notes. Try the browser where you originally saved them.') }
  }
  return <><RouteSeo path="/worksheet" /><main id="main-content" className="simple-start notes-recovery"><header className="hub-heading"><h1>Your previous <em>notes.</em></h1><p>The site now focuses on getting started and finding programs. You can download notes and tool drafts saved in this browser before the update.</p></header><button type="button" className="button primary" onClick={download}>Download previous notes</button><p role="status">{status}</p><p>Saved work stays on the original device and website address. Downloading a backup does not change or delete it.</p><Link className="resource-direct" to="/start-here">Start on your own →</Link></main></>
}

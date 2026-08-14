import { useId, useState } from 'react'
import {
  createSourceLogEntry,
  readResearchRecord,
  saveResearchRecord,
} from '../../utils/researchRecord.js'
import './source-triage.css'

const EMPTY = {
  title: '',
  url: '',
  purpose: '',
  claim: '',
  method: '',
  evidence: '',
  limitation: '',
  unresolved: '',
  verifiedOriginal: false,
}

export default function SourceTriage() {
  const id = useId()
  const [note, setNote] = useState({ ...EMPTY })
  const [status, setStatus] = useState('')

  function update(field, value) {
    setNote((current) => ({ ...current, [field]: value }))
    setStatus('')
  }

  function save() {
    if (!note.title.trim() && !note.url.trim()) {
      setStatus('Add a title or identifier before saving.')
      return
    }
    try {
      const record = readResearchRecord(window.localStorage)
      const entry = createSourceLogEntry({
        title: note.title,
        url: note.url,
        purpose: note.purpose,
        contribution: [
          note.claim && `Claim: ${note.claim}`,
          note.evidence && `Evidence: ${note.evidence}`,
        ].filter(Boolean).join('\n'),
        method: note.method,
        limitation: note.limitation,
        unresolved: note.unresolved,
        verifiedOriginal: note.verifiedOriginal,
      })
      saveResearchRecord({ ...record, sourceLog: [...record.sourceLog, entry] }, window.localStorage)
      setStatus('Source note saved to Research Record.')
      setNote({ ...EMPTY })
    } catch {
      setStatus('Could not save locally. Your text remains on this page.')
    }
  }

  return (
    <section className="source-triage" aria-labelledby={`${id}-title`}>
      <div>
        <p className="eyebrow">Try · Source triage</p>
        <h2 id={`${id}-title`}>What are you trying to learn from this source?</h2>
        <p>Read the original source before marking it verified. Saving a source is not the same as recording evidence from your own investigation.</p>
      </div>
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="source-triage-grid">
          {[
            ['title', 'Title or identifier'],
            ['url', 'URL / DOI'],
            ['purpose', 'Why did you open it?'],
            ['claim', 'What claim does it make?'],
            ['method', 'How was the result produced?'],
            ['evidence', 'What evidence supports the claim?'],
            ['limitation', 'What important limitation is visible?'],
            ['unresolved', 'What question remains unresolved?'],
          ].map(([field, label]) => (
            <label key={field}>
              <span>{label}</span>
              <textarea
                rows={field === 'title' || field === 'url' ? 2 : 3}
                value={note[field]}
                onChange={(event) => update(field, event.target.value)}
                inputMode={field === 'url' ? 'url' : undefined}
              />
            </label>
          ))}
        </div>
        <label className="source-triage-check">
          <input
            type="checkbox"
            checked={note.verifiedOriginal}
            onChange={(event) => update('verifiedOriginal', event.target.checked)}
          />
          I opened and inspected the original source.
        </label>
        <button className="button primary" type="button" onClick={save}>Save source note to Research Record</button>
        <p role="status" aria-live="polite">{status}</p>
      </form>
    </section>
  )
}

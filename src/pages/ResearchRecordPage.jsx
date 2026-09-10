import { useEffect, useRef, useState } from 'react'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import {
  MAX_RESEARCH_RECORD_IMPORT_BYTES,
  clearResearchRecord,
  createEvidenceLogEntry,
  createEmptyResearchRecord,
  createMentorBrief,
  createRevisionEntry,
  createSourceLogEntry,
  exportResearchRecordJson,
  exportResearchRecordMarkdown,
  importResearchRecord,
  readResearchRecord,
  saveResearchRecord,
} from '../utils/researchRecord.js'

const GROUPS = [
  ['startingPoint', 'Starting point', [
    ['interest', 'Interest', 'What keeps drawing your attention?'],
    ['direction', 'Direction / discipline', 'Which lens or direction currently helps you frame it?'],
    ['phenomenon', 'Phenomenon', 'What specific behavior, object, pattern, or change are you studying?'],
  ]],
  ['question', 'Question', [
    ['current', 'Current question', 'Write the question you are using now.'],
    ['history', 'Question history', 'Keep earlier wording and why it changed.'],
  ]],
  ['literature', 'Literature notes', [
    ['sources', 'Sources', 'Record inspectable citations, links, and source notes.'],
    ['expertPatterns', 'Expert patterns', 'How do researchers in this discipline frame similar work?'],
    ['unknownConcepts', 'Unknown concepts', 'Which terms or methods still need explanation?'],
  ]],
  ['investigation', 'Investigation plan', [
    ['mode', 'Mode', 'For example: experiment, proof, textual analysis, observation, simulation, or design study.'],
    ['smallestInvestigation', 'Smallest investigation', 'What is the smallest real attempt that could teach you something?'],
    ['evidenceTarget', 'Evidence target', 'What data, texts, proof route, simulation, or observations can you inspect?'],
    ['challengeComparison', 'Challenge / comparison', 'What result, case, or alternative could challenge your current idea?'],
    ['constraints', 'Constraints', 'What limits of time, access, tools, safety, or scope shape the work?'],
    ['limitations', 'Limitations', 'What can this investigation not establish?'],
    ['firstAction', 'First action', 'Name the first concrete, observable action.'],
  ]],
  ['feedbackRevision', 'Feedback and revision', [
    ['mentors', 'Mentors / reviewers', 'Who reviewed the work, and what expertise did they bring?'],
    ['feedback', 'Feedback', 'Record advice accurately before deciding whether to use it.'],
    ['revisions', 'Revisions', 'What changed because of evidence or feedback?'],
  ]],
  ['next', 'Next', [
    ['action', 'Next action', 'Name one concrete action, not a vague intention.'],
    ['output', 'Next output', 'What inspectable artifact will that action produce?'],
  ]],
]

const SOURCE_FIELDS = [
  ['title', 'Title'], ['author', 'Author'], ['year', 'Year'], ['url', 'URL'], ['type', 'Source type'],
  ['purpose', 'Why you opened it'], ['contribution', 'Useful contribution'], ['method', 'Method'],
  ['limitation', 'Limitation'], ['unresolved', 'Unresolved question'],
]

const EVIDENCE_FIELDS = [
  ['finding', 'Finding'], ['source', 'Source'], ['relevance', 'Relevance'],
  ['limitation', 'Limitation'], ['next', 'What to inspect next'],
]

const REVISION_FIELDS = [
  ['date', 'Date'], ['change', 'What changed'], ['reason', 'Why it changed'], ['trigger', 'Evidence or feedback that triggered it'],
]

function downloadText(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function LogSection({ title, description, entries, fields, onAdd, onUpdate, onRemove, children }) {
  return (
    <details className="worksheet-section">
      <summary><h2>{title}</h2></summary>
      <p>{description}</p>
      {entries.map((entry, index) => (
        <fieldset key={entry.id}>
          <legend>{title.replace(' log', '')} {index + 1}</legend>
          {fields.map(([field, label]) => (
            <label className="worksheet-field" key={field}>
              <span className="field-copy"><strong>{label}</strong></span>
              {field === 'url' || field === 'date' ? (
                <input
                  type={field === 'url' ? 'url' : 'date'}
                  value={entry[field]}
                  onChange={(event) => onUpdate(entry.id, field, event.target.value)}
                  placeholder={field === 'url' ? 'https://…' : undefined}
                />
              ) : (
                <textarea
                  rows="2"
                  value={entry[field]}
                  onChange={(event) => onUpdate(entry.id, field, event.target.value)}
                  placeholder="Write here…"
                />
              )}
            </label>
          ))}
          {children?.(entry, onUpdate)}
          <button className="text-button" type="button" onClick={() => onRemove(entry.id)}>
            Remove {title.replace(' log', '').toLowerCase()}
          </button>
        </fieldset>
      ))}
      <button className="button secondary" type="button" onClick={onAdd}>Add {title.replace(' log', '').toLowerCase()}</button>
    </details>
  )
}

export default function ResearchRecordPage() {
  const [record, setRecord] = useState(() => createEmptyResearchRecord())
  const [note, setNote] = useState('')
  const [mentorBrief, setMentorBrief] = useState('')
  const [importMode, setImportMode] = useState('')
  const [pendingImport, setPendingImport] = useState(false)
  const fileInput = useRef(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecord(readResearchRecord(window.localStorage))
      setNote('Changes save automatically on this device')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  function saveEdit(next) {
    setRecord(next)
    if (pendingImport) {
      setNote('Imported draft: review it, then press Save to keep it')
      return
    }
    try {
      saveResearchRecord(next, window.localStorage)
      setNote('Saved on this device')
    } catch {
      setNote('Could not save. Keep this page open and download a backup.')
    }
  }

  function update(group, field, value) {
    saveEdit({ ...record, [group]: { ...record[group], [field]: value } })
  }

  function updateLog(log, id, field, value) {
    saveEdit({ ...record, [log]: record[log].map(entry => entry.id === id ? { ...entry, [field]: value } : entry) })
  }

  function addLogEntry(log, factory) {
    saveEdit({ ...record, [log]: [...record[log], factory()] })
  }

  function removeLogEntry(log, id) {
    if (!window.confirm('Remove this entry from your notes?')) return
    saveEdit({ ...record, [log]: record[log].filter(entry => entry.id !== id) })
  }

  function save() {
    try {
      setRecord(saveResearchRecord(record, window.localStorage))
      setPendingImport(false)
      setNote('Saved on this device')
    } catch {
      setNote('Could not save. Your current record is still open and unchanged.')
    }
  }

  function clear() {
    if (!window.confirm('Clear the entire Research Record from this browser? This cannot be undone.')) return
    setRecord(clearResearchRecord(window.localStorage))
    setPendingImport(false)
    setNote('Research Record cleared')
  }

  function exportFile(format) {
    try {
      const date = new Date().toISOString().slice(0, 10)
      if (format === 'json') {
        downloadText(`research-record-${date}.json`, exportResearchRecordJson(record), 'application/json')
      } else {
        downloadText(`research-record-${date}.md`, exportResearchRecordMarkdown(record), 'text/markdown')
      }
      setNote(`${format.toUpperCase()} export downloaded`)
    } catch {
      setNote('Could not create the export. Your record is unchanged.')
    }
  }

  async function importFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!importMode) {
      setNote('Choose merge or replace before importing.')
      return
    }
    if (file.size > MAX_RESEARCH_RECORD_IMPORT_BYTES) {
      setNote(`Import is too large. Maximum size is ${Math.round(MAX_RESEARCH_RECORD_IMPORT_BYTES / 1024)} KB.`)
      return
    }
    const action = importMode === 'replace'
      ? 'Replace the current on-screen record with this file? Nothing is saved until you press Save imported draft.'
      : 'Merge this file into the current on-screen record? Matching imported fields take precedence. Nothing is saved until you press Save imported draft.'
    if (!window.confirm(action)) {
      setNote('Import cancelled; current record unchanged.')
      return
    }
    try {
      const json = await file.text()
      const imported = importResearchRecord(record, json, importMode)
      setRecord(imported)
      setPendingImport(true)
      setNote(`Import ${importMode} complete. Review it, then Save imported draft to keep it.`)
    } catch (error) {
      setNote(`Import failed: ${error instanceof Error ? error.message : 'unknown error'} Current record unchanged.`)
    }
  }

  async function copyMentorBrief() {
    if (!mentorBrief) {
      setNote('Generate the mentor brief before copying.')
      return
    }
    try {
      await navigator.clipboard.writeText(mentorBrief)
      setNote('Mentor brief copied')
    } catch {
      setNote('Could not copy automatically. Select the brief text and copy it manually.')
    }
  }

  return (
    <>
      <RouteSeo path="/worksheet" />
      <PageIntro
        eyebrow="Your research notebook"
        title={<>Keep your next step <em>in sight.</em></>}
        description="A question, a source, and one next action. Add more detail when you need it."
      >
        <div className="worksheet-actions">
          <button className="button primary" type="button" onClick={save}>{pendingImport ? 'Save imported draft' : 'Save now'}</button>
          <button className="button secondary" type="button" onClick={() => exportFile('json')}>Download a backup</button>
        </div>
        <p className="worksheet-status" aria-live="polite" data-unsaved={pendingImport}>{note}</p>
      </PageIntro>
      <main id="main-content" className="worksheet-content">
        <p className="privacy-note">Your notes stay in this browser on this device. Download a backup to move them elsewhere or keep another copy.</p>
        <form className="worksheet-form" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="notebook-basics">
            <legend className="sr-only">My research notes</legend>
            {[
              ['question', 'current', 'My question', 'What do you want to understand?'],
              ['literature', 'sources', 'Useful sources', 'Keep a title, link, and a sentence about why it helps.'],
              ['next', 'action', 'My next step', 'One small thing you can do next.'],
            ].map(([group, field, label, prompt], index) => <label className="worksheet-field" key={field}><span className="field-copy"><span className="notebook-number" aria-hidden="true">0{index + 1}</span><strong>{label}</strong><small>{prompt}</small></span><textarea rows="3" value={record[group][field]} onChange={event => update(group, field, event.target.value)} placeholder="Write here…" /></label>)}
          </fieldset>
          <details className="worksheet-section notebook-extra"><summary><h2>More detail <span>(optional)</span></h2></summary>
          {[GROUPS[1], GROUPS[5], GROUPS[0], GROUPS[3], GROUPS[2], GROUPS[4]].map(([group, legend, fields]) => (
            <details className="worksheet-section" key={group}>
              <summary><h2>{legend}</h2></summary>
              <fieldset>
                <legend className="sr-only">{legend}</legend>
                {fields.filter(([field]) => !['question.current', 'literature.sources', 'next.action'].includes(`${group}.${field}`)).map(([field, label, prompt]) => (
                  <label className="worksheet-field" key={field}>
                    <span className="field-copy"><strong>{label}</strong><small>{prompt}</small></span>
                    <textarea
                      rows="3"
                      value={record[group][field]}
                      onChange={(event) => update(group, field, event.target.value)}
                      placeholder="Write here…"
                    />
                  </label>
                ))}
              </fieldset>
            </details>
          ))}
          <LogSection
            title="Source log"
            description="Keep the citation, useful contribution, and limitation of each source."
            entries={record.sourceLog}
            fields={SOURCE_FIELDS}
            onAdd={() => addLogEntry('sourceLog', createSourceLogEntry)}
            onUpdate={(id, field, value) => updateLog('sourceLog', id, field, value)}
            onRemove={(id) => removeLogEntry('sourceLog', id)}
          >
            {(entry, onUpdate) => (
              <label className="worksheet-field">
                <input
                  type="checkbox"
                  checked={entry.verifiedOriginal}
                  onChange={(event) => onUpdate(entry.id, 'verifiedOriginal', event.target.checked)}
                />
                <span className="field-copy">
                  <strong>I inspected the original source</strong>
                  <small>This records your check; it does not certify the source as true or reliable.</small>
                </span>
              </label>
            )}
          </LogSection>
          <LogSection
            title="Evidence log"
            description="Separate findings from your interpretation, including evidence that challenges or complicates your idea."
            entries={record.evidenceLog}
            fields={EVIDENCE_FIELDS}
            onAdd={() => addLogEntry('evidenceLog', createEvidenceLogEntry)}
            onUpdate={(id, field, value) => updateLog('evidenceLog', id, field, value)}
            onRemove={(id) => removeLogEntry('evidenceLog', id)}
          >
            {(entry, onUpdate) => (
              <label className="worksheet-field">
                <span className="field-copy"><strong>Stance</strong><small>How does this finding relate to the current idea?</small></span>
                <select value={entry.stance} onChange={(event) => onUpdate(entry.id, 'stance', event.target.value)}>
                  <option value="support">Support</option>
                  <option value="challenge">Challenge</option>
                  <option value="complicate">Complicate</option>
                  <option value="unclear">Unclear</option>
                </select>
              </label>
            )}
          </LogSection>
          <LogSection
            title="Revision history"
            description="Record why the work changed, not only what changed."
            entries={record.revisionHistory}
            fields={REVISION_FIELDS}
            onAdd={() => addLogEntry('revisionHistory', () => createRevisionEntry({ date: new Date().toISOString().slice(0, 10) }))}
            onUpdate={(id, field, value) => updateLog('revisionHistory', id, field, value)}
            onRemove={(id) => removeLogEntry('revisionHistory', id)}
          />
          </details>
        </form>
        <details className="worksheet-section" id="mentor-brief">
          <summary><h2>Mentor brief</h2></summary>
          <p>Generate a snapshot from the current on-screen record, then edit it locally before copying. The brief is not saved or sent anywhere.</p>
          <div className="worksheet-actions">
            <button className="button secondary" type="button" onClick={() => setMentorBrief(createMentorBrief(record))}>
              Generate from current record
            </button>
            <button className="button secondary" type="button" onClick={copyMentorBrief}>Copy brief</button>
          </div>
          <label className="worksheet-field">
            <span className="field-copy"><strong>Editable mentor brief</strong></span>
            <textarea rows="16" value={mentorBrief} onChange={(event) => setMentorBrief(event.target.value)} />
          </label>
        </details>
        <details className="worksheet-section">
          <summary><h2>Import a backup</h2></summary>
          <p>JSON only, up to {Math.round(MAX_RESEARCH_RECORD_IMPORT_BYTES / 1024)} KB. Import changes the on-screen draft only; press Save after reviewing it.</p>
          <fieldset>
            <legend>Choose how to import</legend>
            <label>
              <input type="radio" name="import-mode" value="merge" checked={importMode === 'merge'} onChange={(event) => setImportMode(event.target.value)} />
              Merge (imported non-empty fields take precedence; log entries are matched by ID)
            </label>
            <label>
              <input type="radio" name="import-mode" value="replace" checked={importMode === 'replace'} onChange={(event) => setImportMode(event.target.value)} />
              Replace the current on-screen record
            </label>
          </fieldset>
          <input
            ref={fileInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={importFile}
          />
          <button className="button secondary" type="button" onClick={() => fileInput.current?.click()}>
            Choose JSON file
          </button>
        </details>
        <div className="worksheet-bottom-actions">
          <button className="button primary" type="button" onClick={save}>{pendingImport ? 'Save imported draft' : 'Save now'}</button>
          <button className="button secondary" type="button" onClick={() => window.print()}>Print</button>
          <button className="button secondary" type="button" onClick={() => exportFile('markdown')}>Export text</button>
          <button className="text-button" type="button" onClick={clear}>Clear my notes</button>
        </div>
      </main>
    </>
  )
}

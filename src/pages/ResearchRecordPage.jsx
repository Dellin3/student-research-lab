import { useEffect, useState } from 'react'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import {
  clearResearchRecord,
  createEmptyResearchRecord,
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
  ['literature', 'Literature', [
    ['sources', 'Sources', 'Record inspectable citations, links, and source notes.'],
    ['expertPatterns', 'Expert patterns', 'How do researchers in this discipline frame similar work?'],
    ['unknownConcepts', 'Unknown concepts', 'Which terms or methods still need explanation?'],
  ]],
  ['investigation', 'Investigation', [
    ['smallestTest', 'Smallest test', 'What is the smallest real attempt that could teach you something?'],
    ['evidenceSource', 'Evidence source', 'What data, texts, proof route, simulation, or observations can you inspect?'],
    ['assumptions', 'Assumptions', 'What are you treating as fixed or true for now?'],
    ['limitations', 'Limitations', 'What can this investigation not establish?'],
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

export default function ResearchRecordPage() {
  const [record, setRecord] = useState(() => createEmptyResearchRecord())
  const [note, setNote] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecord(readResearchRecord(window.localStorage))
      setNote('Loaded and migrated local record')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  function update(group, field, value) {
    setRecord((current) => ({
      ...current,
      [group]: { ...current[group], [field]: value },
    }))
    setNote('Unsaved changes')
  }

  function save() {
    setRecord(saveResearchRecord(record, window.localStorage))
    setNote('Saved locally')
  }

  function clear() {
    if (!window.confirm('Clear the entire Research Record from this browser? This cannot be undone.')) return
    setRecord(clearResearchRecord(window.localStorage))
    setNote('Research Record cleared')
  }

  return (
    <>
      <RouteSeo path="/worksheet" />
      <PageIntro
        eyebrow="Local working document"
        title="Research Record"
        description="Keep the question, evidence, revisions, and next action together as your work changes."
      >
        <div className="worksheet-actions">
          <button className="button primary" type="button" onClick={save}>Save</button>
          <button className="button secondary" type="button" onClick={() => window.print()}>Print</button>
          <button className="text-button" type="button" onClick={clear}>Clear</button>
        </div>
        <p aria-live="polite">{note}</p>
      </PageIntro>
      <main id="main-content" className="worksheet-content">
        <p className="privacy-note">Your entries stay in this browser and are not sent to a server.</p>
        <form className="worksheet-form" onSubmit={(event) => event.preventDefault()}>
          {GROUPS.map(([group, legend, fields]) => (
            <fieldset key={group}>
              <legend><h2>{legend}</h2></legend>
              {fields.map(([field, label, prompt]) => (
                <label className="worksheet-field" key={field}>
                  <span className="field-copy"><strong>{label}</strong><small>{prompt}</small></span>
                  <textarea
                    rows="4"
                    value={record[group][field]}
                    onChange={(event) => update(group, field, event.target.value)}
                    placeholder="Write here…"
                  />
                </label>
              ))}
            </fieldset>
          ))}
        </form>
        <div className="worksheet-bottom-actions">
          <button className="button primary" type="button" onClick={save}>Save</button>
          <button className="button secondary" type="button" onClick={() => window.print()}>Print</button>
        </div>
      </main>
    </>
  )
}

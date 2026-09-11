import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  importMappedDraft,
  readResearchRecord,
  recordsWouldConflict,
  saveResearchRecord,
} from '../../utils/researchRecord.js'
import {
  EMPTY_PLANNER_DRAFT,
  INVESTIGATION_PLANNER_KEY,
  PLANNER_STEPS,
  RESEARCH_MODES,
  getMode,
  planSummary,
  plannerDraftToRecord,
  plannerStatus,
  readPlannerDraft,
  readQuestionSources,
  savePlannerDraft,
  structureStates,
} from '../../utils/investigationPlanner.js'

const REVIEW_PROMPTS = [
  'Can the evidence be accessed legally, safely, and within the available time?',
  'Would a teacher, mentor, librarian, or subject expert recognize the proposed method as appropriate?',
  'Could the work affect people, animals, privacy, equipment, or the environment?',
  'Does the smallest version produce something another person could inspect?',
]

function Field({ id, label, value, onChange, help, placeholder, rows = 4 }) {
  return (
    <div className="ip-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        aria-describedby={help ? `${id}-help` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {help ? <p id={`${id}-help`} className="ip-help">{help}</p> : null}
    </div>
  )
}

export default function InvestigationPlanner() {
  const baseId = useId()
  const summaryElement = useRef(null)
  const saveTimer = useRef(null)
  const [draft, setDraft] = useState({ ...EMPTY_PLANNER_DRAFT })
  const [stepIndex, setStepIndex] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [questionSources, setQuestionSources] = useState([])
  const [saveNote, setSaveNote] = useState('Draft stays in this browser')
  const [recordChoice, setRecordChoice] = useState(null)

  const mode = getMode(draft.mode)
  const status = useMemo(() => plannerStatus(draft), [draft])
  const nodes = useMemo(() => structureStates(draft), [draft])
  const summary = useMemo(() => planSummary(draft), [draft])
  const step = PLANNER_STEPS[stepIndex]

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readPlannerDraft(window.localStorage)
      setDraft(saved)
      setQuestionSources(readQuestionSources(window.localStorage))
      if (saved.question) setSaveNote('Saved local draft restored')
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hydrated) return undefined
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      try {
        savePlannerDraft(draft, window.localStorage)
        setSaveNote('Saved locally')
      } catch {
        setSaveNote('Could not save locally in this browser')
      }
    }, 350)
    return () => window.clearTimeout(saveTimer.current)
  }, [draft, hydrated])

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
    setRecordChoice(null)
  }

  function clearDraft() {
    setDraft({ ...EMPTY_PLANNER_DRAFT })
    setStepIndex(0)
    setRecordChoice(null)
    try {
      window.localStorage.removeItem(INVESTIGATION_PLANNER_KEY)
      setSaveNote('Local planner draft cleared')
    } catch {
      setSaveNote('Draft cleared on screen')
    }
  }

  function requestRecordSave() {
    try {
      const current = readResearchRecord(window.localStorage)
      const incoming = plannerDraftToRecord(draft)
      if (recordsWouldConflict(current, incoming)) {
        setRecordChoice('conflict')
        return
      }
      const next = importMappedDraft(current, incoming, 'replace')
      saveResearchRecord(next, window.localStorage)
      setRecordChoice('saved')
    } catch {
      setRecordChoice('error')
    }
  }

  function resolveRecordConflict(choice) {
    if (choice === 'cancel') {
      setRecordChoice(null)
      return
    }
    try {
      const current = readResearchRecord(window.localStorage)
      if (choice === 'replace') {
        const next = importMappedDraft(current, plannerDraftToRecord(draft), 'replace')
        saveResearchRecord(next, window.localStorage)
        setRecordChoice('saved')
      } else {
        setRecordChoice('kept')
      }
    } catch {
      setRecordChoice('error')
    }
  }

  const stepFields = {
    question: (
      <fieldset className="ip-fieldset">
        <legend>Which research question will this plan investigate?</legend>
        {questionSources.length > 0 ? (
          <div className="ip-source-list" role="group" aria-label="Questions available in this browser">
            {questionSources.map((source) => (
              <button
                key={source.id}
                type="button"
                className="ip-source"
                onClick={() => update('question', source.question)}
              >
                <span>{source.label}</span>
                {source.question}
              </button>
            ))}
          </div>
        ) : (
          <p className="ip-help">
            No usable question was found in the current Research Record or Question Builder draft.
            Manual entry always works.
          </p>
        )}
        <Field
          id={`${baseId}-question`}
          label="Research question"
          value={draft.question}
          onChange={(value) => update('question', value)}
          help="Use a question that is bounded enough to investigate. Imported text is copied here and remains editable."
          placeholder="How does…? Under what conditions…? To what extent…?"
        />
      </fieldset>
    ),
    mode: (
      <fieldset className="ip-fieldset">
        <legend>What kind of work could answer the question?</legend>
        <p className="ip-help">Choose the closest primary mode. Real projects may combine modes later.</p>
        <div className="ip-mode-grid">
          {RESEARCH_MODES.map((item) => (
            <label key={item.id} className={draft.mode === item.id ? 'is-selected' : ''}>
              <input
                type="radio"
                name={`${baseId}-mode`}
                value={item.id}
                checked={draft.mode === item.id}
                onChange={() => update('mode', item.id)}
              />
              <span>{item.label}</span>
              <small>{item.evidencePrompt}</small>
            </label>
          ))}
        </div>
      </fieldset>
    ),
    evidence: (
      <fieldset className="ip-fieldset">
        <legend>What evidence will another person be able to inspect?</legend>
        <Field
          id={`${baseId}-evidence`}
          label={mode?.evidencePrompt || 'Name the data, observations, measurements, derivation, or model output.'}
          value={draft.evidence}
          onChange={(value) => update('evidence', value)}
          help="Evidence is more useful when you name its source, scale, and how it will be recorded."
          placeholder={mode?.evidenceExample || 'Name a concrete source and inspectable output'}
        />
      </fieldset>
    ),
    smallest: (
      <fieldset className="ip-fieldset">
        <legend>What is the smallest version that could teach you something?</legend>
        <Field
          id={`${baseId}-smallest`}
          label="Smallest test"
          value={draft.smallestTest}
          onChange={(value) => update('smallestTest', value)}
          help="Shrink the investigation to one comparison, bounded family, dataset slice, parameter, place, or time window."
          placeholder={mode?.smallestExample || 'Describe a first attempt small enough to finish'}
        />
      </fieldset>
    ),
    challenge: (
      <fieldset className="ip-fieldset">
        <legend>What result would challenge the plan or your expectation?</legend>
        <Field
          id={`${baseId}-challenge`}
          label="A result that would force revision"
          value={draft.challenge}
          onChange={(value) => update('challenge', value)}
          help="A useful investigation can fail informatively. This planner does not decide whether your claim is true."
          placeholder={mode?.challengeExample || 'Describe an observation, counterexample, or failed baseline'}
        />
      </fieldset>
    ),
    limits: (
      <fieldset className="ip-fieldset">
        <legend>What boundaries make the plan honest and workable?</legend>
        <Field
          id={`${baseId}-constraints`}
          label="Practical constraints"
          value={draft.constraints}
          onChange={(value) => update('constraints', value)}
          help="Include time, tools, skills, access, cost, safety, permissions, or computing limits."
          placeholder="I have four weeks, a laptop, and access only to public data…"
          rows={3}
        />
        <Field
          id={`${baseId}-limitation`}
          label="Known limitation"
          value={draft.limitation}
          onChange={(value) => update('limitation', value)}
          help="Name what the first result will not establish or generalize to."
          placeholder="This small sample cannot establish causation or represent…"
          rows={3}
        />
      </fieldset>
    ),
    action: (
      <fieldset className="ip-fieldset">
        <legend>What concrete action can you complete first?</legend>
        <Field
          id={`${baseId}-action`}
          label="First action"
          value={draft.firstAction}
          onChange={(value) => update('firstAction', value)}
          help="Prefer an action with a visible output: download, define, calculate, measure, code, annotate, or ask."
          placeholder="By Friday, download the dataset and document its columns and missing values."
        />
        <section className="ip-human-review" aria-labelledby={`${baseId}-review-title`}>
          <p className="ip-tag">HUMAN REVIEW</p>
          <h3 id={`${baseId}-review-title`}>Checks a form cannot decide</h3>
          <p>Review these with a teacher, mentor, librarian, lab supervisor, or knowledgeable peer.</p>
          <ul>{REVIEW_PROMPTS.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul>
          <Field
            id={`${baseId}-review-notes`}
            label="Review notes (optional)"
            value={draft.reviewNotes}
            onChange={(value) => update('reviewNotes', value)}
            placeholder="Who reviewed the plan, what they questioned, and what you changed"
            rows={3}
          />
          <label className="ip-review-check">
            <input
              type="checkbox"
              checked={draft.humanReviewed}
              onChange={(event) => update('humanReviewed', event.target.checked)}
            />
            <span>I completed a human review of feasibility, method, ethics, and safety.</span>
          </label>
        </section>
      </fieldset>
    ),
  }

  return (
    <div className="ip-tool">
      <div className="ip-toolbar">
        <div>
          <p className="ip-save-note" aria-live="polite">{saveNote}</p>
          <p className="ip-privacy">Your draft stays in this browser and is never sent to analytics or an external service.</p>
        </div>
        <button type="button" className="ip-text-button" onClick={clearDraft}>Clear saved draft</button>
      </div>

      <ol className="ip-progress" aria-label="Investigation planning steps">
        {PLANNER_STEPS.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className={`${index === stepIndex ? 'is-current ' : ''}${index < stepIndex ? 'is-past' : ''}`}
              aria-current={index === stepIndex ? 'step' : undefined}
              onClick={() => setStepIndex(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="ip-layout">
        <div className="ip-main">
          <p className="ip-kicker">Step {stepIndex + 1} of {PLANNER_STEPS.length}</p>
          <h2>{step.label}</h2>
          {stepFields[step.id]}
          <div className="ip-nav">
            {stepIndex > 0 ? (
              <button type="button" className="button secondary" onClick={() => setStepIndex((index) => index - 1)}>
                Back
              </button>
            ) : null}
            <button
              type="button"
              className="button primary"
              onClick={() => {
                if (stepIndex < PLANNER_STEPS.length - 1) setStepIndex(stepIndex + 1)
                else if (summaryElement.current) {
                  summaryElement.current.open = true
                  summaryElement.current.scrollIntoView({ block: 'center', behavior: 'instant' })
                  summaryElement.current.querySelector('summary')?.focus({ preventScroll: true })
                }
              }}
            >
              {stepIndex === PLANNER_STEPS.length - 1 ? 'Review plan' : 'Next step'}
            </button>
          </div>
        </div>

        <aside className="ip-live" aria-label="Live investigation structure">
          <div className="ip-live-inner">
            <p className="ip-kicker">Live structure</p>
            <p className="ip-status" aria-live="polite">{status.label}</p>
            {status.label === 'STRUCTURALLY COMPLETE' ? (
              <p className="ip-complete-note">
                The visible planning pieces are present. Review feasibility, prior work, and method quality before treating this as a final research design.
              </p>
            ) : null}
            <ol className="ip-structure">
              {nodes.map(([label, state]) => (
                <li key={label} className={`is-${state}`}>
                  <span aria-hidden="true" />
                  <strong>{label}</strong>
                  <small>{state}</small>
                </li>
              ))}
            </ol>

            <details className="ip-summary" ref={summaryElement} open={status.count >= 4}>
              <summary>First plan summary</summary>
              <dl>
                {summary.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || 'Not defined yet'}</dd>
                  </div>
                ))}
              </dl>
            </details>

            <div className="ip-record-actions">
              <button type="button" className="button primary" onClick={requestRecordSave}>
                Save to Research Record
              </button>
              <Link className="button secondary" to="/ai-literature">Find and read papers</Link>
              <Link className="ip-record-link" to="/worksheet">Open Research Record</Link>
            </div>

            {recordChoice === 'conflict' ? (
              <div className="ip-conflict" role="region" aria-label="Research Record conflict">
                <p>The Research Record has a different current question. Nothing has been overwritten.</p>
                <button type="button" className="button primary" onClick={() => resolveRecordConflict('replace')}>
                  Replace mapped record fields
                </button>
                <button type="button" className="button secondary" onClick={() => resolveRecordConflict('keep')}>
                  Keep record unchanged
                </button>
                <button type="button" className="ip-text-button" onClick={() => resolveRecordConflict('cancel')}>Cancel</button>
              </div>
            ) : null}
            {recordChoice === 'saved' ? <p className="ip-record-note" role="status">Plan saved to the Research Record.</p> : null}
            {recordChoice === 'kept' ? <p className="ip-record-note" role="status">Existing Research Record kept unchanged.</p> : null}
            {recordChoice === 'error' ? <p className="ip-record-note" role="alert">The Research Record could not be updated.</p> : null}
          </div>
        </aside>
      </div>
    </div>
  )
}

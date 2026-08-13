import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  EMPTY_NARROWING_STATE,
  NARROWING_DISCIPLINES,
  NARROWING_EXAMPLES,
  NARROWING_STAGES,
  NARROWING_STORAGE_KEY,
  getLenses,
} from '../../data/topicNarrowingPresets.js'
import {
  builderHandoffFromNarrowing,
  currentCoach,
  explainNarrowing,
  generateDirections,
  nodeStates,
  writeNarrowingHandoff,
} from '../../utils/topicNarrowing.js'
import {
  importNarrowingDraft,
  narrowingImportNeedsConfirmation,
  readResearchRecord,
  saveResearchRecord,
} from '../../utils/researchRecord.js'

function nodeClass(state) {
  return `tn-node is-${state}`
}

function StructureDiagram({ states }) {
  const nodes = [
    ['Interest', states.interest],
    ['Object', states.object],
    ['Lens', states.lens],
    ['Boundary', states.boundary],
    ['Direction', states.direction],
  ]
  return (
    <figure className="tn-logic" aria-label="Structural path from interest to direction">
      <figcaption className="tn-kicker">Structural path</figcaption>
      <ol className="tn-logic-list">
        {nodes.map(([label, status], index) => (
          <li key={label} className={nodeClass(status)}>
            {index > 0 && <span className="tn-logic-arrow" aria-hidden="true">→</span>}
            <span className="tn-node-label">{label}</span>
            <span className="tn-node-state">{status}</span>
          </li>
        ))}
      </ol>
      <ul className="tn-legend">
        <li><span className="tn-swatch is-defined" /> Defined</li>
        <li><span className="tn-swatch is-partial" /> Partial</li>
        <li><span className="tn-swatch is-waiting" /> Waiting</li>
      </ul>
    </figure>
  )
}

export default function TopicNarrowingLab() {
  const baseId = useId()
  const navigate = useNavigate()
  const [state, setState] = useState(() => ({ ...EMPTY_NARROWING_STATE }))
  const [stageIndex, setStageIndex] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [saveNote, setSaveNote] = useState('')
  const [recordChoice, setRecordChoice] = useState(null)
  const saveTimer = useRef(null)
  const stage = NARROWING_STAGES[stageIndex]
  const lenses = getLenses(state.discipline)
  const directions = useMemo(() => generateDirections(state), [state])
  const chosen = directions.find((item) => item.id === state.chosenDirectionId) || null
  const states = nodeStates(state)
  const coach = currentCoach(state, stage.id)
  const why = chosen ? explainNarrowing(state, chosen.text) : explainNarrowing(state)
  const isEmpty = !Object.values(state).some(Boolean)

  useEffect(() => {
    let saved = null
    try {
      saved = JSON.parse(window.localStorage.getItem(NARROWING_STORAGE_KEY) || 'null')
    } catch {
      saved = null
    }
    const timer = window.setTimeout(() => {
      if (saved && typeof saved === 'object') {
        setState((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.keys(EMPTY_NARROWING_STATE).map((key) => [key, saved[key] ?? '']),
          ),
        }))
        if (typeof saved.stageIndex === 'number' && saved.stageIndex >= 0 && saved.stageIndex < NARROWING_STAGES.length) {
          setStageIndex(saved.stageIndex)
        }
      }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hydrated) return undefined
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(NARROWING_STORAGE_KEY, JSON.stringify({ ...state, stageIndex }))
      } catch {
        /* ignore */
      }
    }, 350)
    return () => window.clearTimeout(saveTimer.current)
  }, [state, stageIndex, hydrated])

  function update(key, value) {
    setState((current) => {
      const next = { ...current, [key]: value }
      if (key === 'discipline' && value !== current.discipline) {
        next.lens = ''
        next.chosenDirectionId = ''
      }
      if (['object', 'lens', 'boundary', 'interest'].includes(key)) {
        next.chosenDirectionId = ''
      }
      return next
    })
    setRecordChoice(null)
  }

  function applyExample(example) {
    setState({ ...EMPTY_NARROWING_STATE, ...example.state })
    setStageIndex(4)
    setSaveNote(`Loaded ${example.label} worked example`)
    setRecordChoice(null)
  }

  function writeRecord(mode) {
    if (!chosen) return
    try {
      const stored = readResearchRecord(window.localStorage)
      const next = importNarrowingDraft(stored, {
        ...state,
        lens: chosen.lensId,
        lensLabel: chosen.lensLabel,
      }, chosen.text, mode)
      saveResearchRecord(next, window.localStorage)
      setSaveNote(mode === 'replace' ? 'Direction replaced the existing Research Record starting point' : 'Direction saved to Research Record')
    } catch {
      setSaveNote('Could not update Research Record')
    }
    setRecordChoice(null)
  }

  function saveToRecord() {
    if (!chosen) return
    const stored = readResearchRecord(window.localStorage)
    if (narrowingImportNeedsConfirmation(stored, { ...state, lens: chosen.lensId, lensLabel: chosen.lensLabel }, chosen.text)) {
      setRecordChoice('choose')
      return
    }
    writeRecord('keep')
  }

  function continueToBuilder() {
    if (!chosen) return
    writeNarrowingHandoff(builderHandoffFromNarrowing({ ...state, lens: chosen.lensId }, chosen.text))
    navigate('/research-question-builder')
  }

  return (
    <div className="tn-lab">
      <div className="tn-toolbar">
        <div className="tn-field-row" role="group" aria-label="Discipline">
          <span className="tn-toolbar-label">Discipline</span>
          <div className="tn-chip-row">
            <button
              type="button"
              className={`tn-chip${!state.discipline ? ' is-selected' : ''}`}
              aria-pressed={!state.discipline}
              onClick={() => update('discipline', '')}
            >
              Not chosen yet
            </button>
            {NARROWING_DISCIPLINES.map((discipline) => (
              <button
                key={discipline}
                type="button"
                className={`tn-chip${state.discipline === discipline ? ' is-selected' : ''}`}
                aria-pressed={state.discipline === discipline}
                onClick={() => update('discipline', discipline)}
              >
                {discipline}
              </button>
            ))}
          </div>
        </div>
        <div className="tn-field-row" role="group" aria-label="Worked examples">
          <span className="tn-toolbar-label">Worked examples</span>
          <div className="tn-chip-row">
            {NARROWING_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                className="tn-chip tn-example-chip"
                onClick={() => applyExample(example)}
              >
                <span className="tn-example-badge">{example.badge}</span>
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ol className="tn-progress" aria-label="Topic narrowing stages">
        {NARROWING_STAGES.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className={`tn-progress-step${index === stageIndex ? ' is-current' : ''}${index < stageIndex ? ' is-complete' : ''}`}
              aria-current={index === stageIndex ? 'step' : undefined}
              onClick={() => setStageIndex(index)}
            >
              <span aria-hidden="true">{item.number}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="tn-layout">
        <div className="tn-workspace">
          <p className="tn-kicker">Stage {stage.number}</p>
          <h2 className="tn-stage-title">{stage.label}</h2>
          <p className="tn-coach" role="status">{coach}</p>

          {stage.id === 'interest' && (
            <fieldset className="tn-fieldset">
              <legend>What keeps pulling your attention back?</legend>
              <label className="tn-label" htmlFor={`${baseId}-interest`}>Interest</label>
              <textarea
                id={`${baseId}-interest`}
                className="tn-textarea"
                rows={4}
                value={state.interest}
                onChange={(event) => update('interest', event.target.value)}
                placeholder="Example: urban heat, graph theory, how people learn"
              />
            </fieldset>
          )}

          {stage.id === 'object' && (
            <fieldset className="tn-fieldset">
              <legend>What specific thing, structure, behavior, system, dataset, population, or pattern interests you?</legend>
              <label className="tn-label" htmlFor={`${baseId}-object`}>Object / phenomenon</label>
              <textarea
                id={`${baseId}-object`}
                className="tn-textarea"
                rows={4}
                value={state.object}
                onChange={(event) => update('object', event.target.value)}
                placeholder="Name one inspectable object, not the whole field"
              />
            </fieldset>
          )}

          {stage.id === 'lens' && (
            <fieldset className="tn-fieldset">
              <legend>What kind of investigation might reveal something?</legend>
              {!state.discipline && (
                <p className="tn-helper">Choose a discipline first. The useful lenses are different in mathematics, computing, and the empirical fields.</p>
              )}
              {lenses.length > 0 && (
                <div className="tn-lens-grid" role="radiogroup" aria-label="Investigative lenses">
                  {lenses.map((lens) => (
                    <label key={lens.id} className={state.lens === lens.id ? 'is-selected' : ''}>
                      <input
                        type="radio"
                        name={`${baseId}-lens`}
                        value={lens.id}
                        checked={state.lens === lens.id}
                        onChange={() => update('lens', lens.id)}
                      />
                      <strong>{lens.label}</strong>
                      <small>{lens.prompt}</small>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          )}

          {stage.id === 'boundary' && (
            <fieldset className="tn-fieldset">
              <legend>What smaller context makes the idea inspectable?</legend>
              <label className="tn-label" htmlFor={`${baseId}-boundary`}>Boundary</label>
              <textarea
                id={`${baseId}-boundary`}
                className="tn-textarea"
                rows={4}
                value={state.boundary}
                onChange={(event) => update('boundary', event.target.value)}
                placeholder="One dataset, theorem family, parameter regime, species, time window, model, comparison, small n, or place"
              />
            </fieldset>
          )}

          {stage.id === 'direction' && (
            <fieldset className="tn-fieldset">
              <legend>Choose a structural research direction</legend>
              {directions.length === 0 && (
                <p className="tn-helper">Add an object, a lens, and a boundary before directions can be generated from those parts.</p>
              )}
              {directions.length > 0 && (
                <div className="tn-direction-list">
                  {directions.map((item) => (
                    <label key={item.id} className={state.chosenDirectionId === item.id ? 'is-selected' : ''}>
                      <input
                        type="radio"
                        name={`${baseId}-direction`}
                        value={item.id}
                        checked={state.chosenDirectionId === item.id}
                        onChange={() => update('chosenDirectionId', item.id)}
                      />
                      <span className="tn-kicker">{item.source} · {item.lensLabel}</span>
                      <strong>{item.text}</strong>
                    </label>
                  ))}
                </div>
              )}
              {chosen && <p className="tn-why">{why}</p>}
            </fieldset>
          )}

          <div className="tn-nav-actions">
            {stageIndex > 0 && (
              <button type="button" className="button secondary" onClick={() => setStageIndex((value) => value - 1)}>Back</button>
            )}
            {stageIndex < NARROWING_STAGES.length - 1 && (
              <button type="button" className="button primary" onClick={() => setStageIndex((value) => value + 1)}>Next</button>
            )}
          </div>
        </div>

        <aside className="tn-preview" aria-label="Live narrowing workspace">
          <div className="tn-levels">
            <article>
              <p className="tn-kicker">Interest</p>
              <p>{state.interest || 'Not named yet.'}</p>
            </article>
            <article className={chosen ? 'is-active' : ''}>
              <p className="tn-kicker">Direction</p>
              <p>{chosen?.text || 'A bounded direction will appear after object, lens, and boundary are named.'}</p>
            </article>
            <article>
              <p className="tn-kicker">Question</p>
              <p>A testable or provable formulation is the next step, in Question Builder. This lab stops at a direction.</p>
            </article>
          </div>
          <StructureDiagram states={states} />
          <div className="tn-preview-actions">
            <button type="button" className="button secondary" disabled={!chosen} onClick={saveToRecord}>
              Save direction to Research Record
            </button>
            <button type="button" className="button primary" disabled={!chosen} onClick={continueToBuilder}>
              Continue to Question Builder
            </button>
            <Link className="tn-text-link" to="/worksheet">Open Research Record</Link>
          </div>
          {recordChoice === 'choose' && (
            <div className="tn-choice" role="region" aria-label="Research Record direction choice">
              <p>Your Research Record already has a different starting point. Choose explicitly:</p>
              <button type="button" className="button secondary" onClick={() => writeRecord('keep')}>Keep existing</button>
              <button type="button" className="button primary" onClick={() => writeRecord('replace')}>Replace with this direction</button>
              <button type="button" className="button ghost" onClick={() => setRecordChoice(null)}>Cancel</button>
            </div>
          )}
          {saveNote && <p className="tn-save-note" role="status">{saveNote}</p>}
          {isEmpty && <p className="tn-privacy">Your work stays in this browser. Nothing is scored, ranked, or sent to a model.</p>}
        </aside>
      </div>
    </div>
  )
}

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BUILDER_EXAMPLES,
  EMPTY_BUILDER_STATE,
  EVIDENCE_ACCESS_OPTIONS,
  FIELD_PRESETS,
  GENERIC_EVIDENCE_SOURCES,
  GENERIC_METHODS,
  STAGES,
  STORAGE_KEY,
  TIME_OPTIONS,
  getFieldPreset,
} from '../../data/questionBuilderPresets.js'
import { buildResearchRecord, generateQuestions } from '../../utils/questionGenerator.js'
import LogicDiagram from './LogicDiagram.jsx'

const WORKSHEET_KEY = 'research-starter-worksheet'

function DiagnosticBar({ score }) {
  const filled = Math.max(0, Math.min(2, score))
  return (
    <span className="qb-meter" aria-hidden="true">
      <span className={filled >= 1 ? 'is-on' : ''} />
      <span className={filled >= 2 ? 'is-on' : ''} />
      <span className={filled >= 2 ? 'is-on is-strong' : ''} />
    </span>
  )
}

async function copyText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  return false
}

function worksheetHasContent(stored) {
  if (!stored || typeof stored !== 'object') return false
  return Object.values(stored).some((value) => String(value || '').trim().length > 0)
}

function mapBuilderToWorksheet(state, primaryQuestion) {
  const questions = [
    primaryQuestion,
    state.factor && state.outcome
      ? `Factor/outcome draft: ${state.factor} → ${state.outcome}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    interest: state.broadInterest || '',
    field: state.field || '',
    phenomenon: state.phenomenon || '',
    questions,
    data: state.evidenceSource || '',
    toyModel: state.smallestVersion || '',
    limitations: [state.mainConstraint, state.timeAvailable && `Time available: ${state.timeAvailable}`]
      .filter(Boolean)
      .join('\n'),
    nextAction: 'Refine the research question and identify the first inspectable test.',
  }
}

export default function QuestionBuilderTool() {
  const baseId = useId()
  const [state, setState] = useState(() => ({ ...EMPTY_BUILDER_STATE }))
  const [stageIndex, setStageIndex] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [saveNote, setSaveNote] = useState('')
  const [copyNote, setCopyNote] = useState('')
  const [fallbackText, setFallbackText] = useState('')
  const [expandedDiagnostic, setExpandedDiagnostic] = useState(null)
  const [worksheetChoice, setWorksheetChoice] = useState(null)
  const saveTimer = useRef(null)
  const lastAnnounced = useRef('')

  const generated = useMemo(() => generateQuestions(state), [state])
  const preset = getFieldPreset(state.field)
  const stage = STAGES[stageIndex]

  useEffect(() => {
    let saved = null
    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    } catch {
      saved = null
    }

    const timer = window.setTimeout(() => {
      if (saved && typeof saved === 'object') {
        setState((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.keys(EMPTY_BUILDER_STATE).map((key) => [key, saved[key] ?? '']),
          ),
        }))
        if (
          typeof saved.stageIndex === 'number'
          && saved.stageIndex >= 0
          && saved.stageIndex < STAGES.length
        ) {
          setStageIndex(saved.stageIndex)
        }
        setSaveNote('Saved locally')
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
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...state, stageIndex }),
        )
        setSaveNote('Saved locally')
      } catch {
        setSaveNote('Could not save locally')
      }
    }, 350)
    return () => window.clearTimeout(saveTimer.current)
  }, [state, stageIndex, hydrated])

  const primaryText = generated.primary?.text || ''
  useEffect(() => {
    if (!primaryText || primaryText === lastAnnounced.current) return
    if (generated.primary?.incomplete) return
    lastAnnounced.current = primaryText
  }, [primaryText, generated.primary?.incomplete])

  function updateField(key, value) {
    setState((current) => ({ ...current, [key]: value }))
  }

  function applyExample(example) {
    setState({ ...EMPTY_BUILDER_STATE, ...example.state })
    setStageIndex(4)
    setCopyNote(`Loaded ${example.label} example`)
    setFallbackText('')
  }

  function clearAll() {
    setState({ ...EMPTY_BUILDER_STATE })
    setStageIndex(0)
    setCopyNote('Cleared')
    setFallbackText('')
  }

  function clearSavedDraft() {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    clearAll()
    setSaveNote('Local draft cleared')
  }

  async function handleCopyQuestion() {
    const text = generated.primary?.incomplete ? '' : generated.primary?.text
    if (!text) {
      setCopyNote('No complete question to copy yet')
      return
    }
    const ok = await copyText(text)
    if (ok) {
      setCopyNote('Question copied')
      setFallbackText('')
    } else {
      setFallbackText(text)
      setCopyNote('Clipboard unavailable — copy from the fallback below')
    }
  }

  async function handleCopyRecord() {
    const { text } = buildResearchRecord(state)
    const ok = await copyText(text)
    if (ok) {
      setCopyNote('Research record copied')
      setFallbackText('')
    } else {
      setFallbackText(text)
      setCopyNote('Clipboard unavailable — copy from the fallback below')
    }
  }

  function openWorksheetFlow() {
    let stored
    try {
      stored = JSON.parse(window.localStorage.getItem(WORKSHEET_KEY) || 'null')
    } catch {
      stored = null
    }
    if (worksheetHasContent(stored)) {
      setWorksheetChoice('choose')
      return
    }
    importBuilderDraft(false)
  }

  function importBuilderDraft(replace) {
    const mapped = mapBuilderToWorksheet(state, generated.primary?.incomplete ? '' : generated.primary?.text)
    let next = { ...mapped }
    if (!replace) {
      try {
        const stored = JSON.parse(window.localStorage.getItem(WORKSHEET_KEY) || 'null') || {}
        next = { ...stored }
        for (const [key, value] of Object.entries(mapped)) {
          if (!String(stored[key] || '').trim() && value) next[key] = value
        }
      } catch {
        next = mapped
      }
    }
    try {
      window.localStorage.setItem(WORKSHEET_KEY, JSON.stringify(next))
      setCopyNote(replace ? 'Builder draft imported into worksheet' : 'Empty worksheet fields filled from builder')
    } catch {
      setCopyNote('Could not write worksheet draft')
    }
    setWorksheetChoice(null)
  }

  const evidenceSuggestions = preset?.evidenceSources || GENERIC_EVIDENCE_SOURCES
  const methodSuggestions = preset?.methods || GENERIC_METHODS
  const liveRegionText = generated.primary && !generated.primary.incomplete
    ? `${generated.statusLabel}: ${generated.primary.text}`
    : ''

  return (
    <div className="qb-tool">
      <div className="qb-tool-toolbar">
        <div className="qb-field-presets" role="group" aria-label="Optional field presets">
          <span className="qb-toolbar-label">Field preset</span>
          <div className="qb-chip-row">
            <button
              type="button"
              className={`qb-chip${!state.field ? ' is-selected' : ''}`}
              aria-pressed={!state.field}
              onClick={() => updateField('field', '')}
            >
              None
            </button>
            {Object.keys(FIELD_PRESETS).map((field) => (
              <button
                key={field}
                type="button"
                className={`qb-chip${state.field === field ? ' is-selected' : ''}`}
                aria-pressed={state.field === field}
                onClick={() => updateField('field', field)}
              >
                {field}
              </button>
            ))}
          </div>
          <p className="qb-helper">
            Presets change examples and suggestions only. They do not write your project for you.
          </p>
        </div>

        <div className="qb-example-row" role="group" aria-label="Educational examples">
          <span className="qb-toolbar-label">Examples</span>
          <div className="qb-chip-row">
            {BUILDER_EXAMPLES.map((example) => (
              <button
                key={example.id}
                type="button"
                className="qb-chip qb-example-chip"
                onClick={() => applyExample(example)}
              >
                <span className="qb-example-badge">{example.badge}</span>
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <div className="qb-utility-row">
          <p className="qb-save-note" aria-live="polite">{saveNote || 'Draft stays in this browser'}</p>
          <div className="qb-utility-actions">
            <button type="button" className="qb-text-btn" onClick={clearAll}>Clear</button>
            <button type="button" className="qb-text-btn" onClick={clearSavedDraft}>Clear Saved Draft</button>
            <button type="button" className="qb-text-btn" onClick={() => { clearAll(); setCopyNote('Started over') }}>Start Over</button>
          </div>
        </div>
        <p className="qb-privacy">
          Your draft stays in this browser. Research Starter Lab does not require an account for this tool.
        </p>
      </div>

      <ol className="qb-progress" aria-label="Research question stages">
        {STAGES.map((item, index) => {
          const current = index === stageIndex
          const reached = index < stageIndex || Object.values(state).some(Boolean)
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`qb-progress-step${current ? ' is-current' : ''}${index < stageIndex ? ' is-complete' : ''}`}
                aria-current={current ? 'step' : undefined}
                onClick={() => setStageIndex(index)}
              >
                <span className="qb-progress-num" aria-hidden="true">{item.number}</span>
                <span className="qb-progress-label">{item.label}</span>
                {reached && index < stageIndex ? <span className="sr-only">Completed, editable</span> : null}
              </button>
            </li>
          )
        })}
      </ol>

      <div className="qb-layout">
        <div className="qb-main-column">
        <div className="qb-workspace">
          <p className="qb-stage-kicker">Stage {stage.number}</p>
          <h2 className="qb-stage-title">{stage.label}</h2>

          {stage.id === 'interest' && (
            <fieldset className="qb-fieldset">
              <legend>What broad subject keeps pulling your attention back?</legend>
              <label className="qb-label" htmlFor={`${baseId}-interest`}>Broad interest</label>
              <input
                id={`${baseId}-interest`}
                className="qb-input"
                value={state.broadInterest}
                onChange={(event) => updateField('broadInterest', event.target.value)}
                aria-describedby={`${baseId}-interest-help`}
                autoComplete="off"
              />
              <p id={`${baseId}-interest-help`} className="qb-helper">
                Do not try to sound academic yet. Start with the thing you genuinely want to understand.
              </p>
              <div className="qb-suggestions" aria-label="Interest examples">
                {(preset?.interestExamples || ["Saturn's rings", 'graph theory', 'neural networks', 'antibiotic resistance', 'urban heat', 'voting behavior']).map((item) => (
                  <button key={item} type="button" className="qb-suggest" onClick={() => updateField('broadInterest', item)}>
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {stage.id === 'phenomenon' && (
            <fieldset className="qb-fieldset">
              <legend>What specific behavior, pattern, mechanism, object, or change inside that interest do you want to understand?</legend>
              <label className="qb-label" htmlFor={`${baseId}-phenomenon`}>Phenomenon</label>
              <textarea
                id={`${baseId}-phenomenon`}
                className="qb-textarea"
                rows={3}
                value={state.phenomenon}
                onChange={(event) => updateField('phenomenon', event.target.value)}
                aria-describedby={`${baseId}-phenomenon-help`}
              />
              <p id={`${baseId}-phenomenon-help`} className="qb-helper">
                A field is not yet a research topic. Look for something that changes, behaves, interacts, or can be compared.
              </p>
              <div className="qb-suggestions" aria-label="Phenomenon examples">
                {(preset?.phenomenonExamples || [
                  'how fine radial structure appears in occultation-derived profiles',
                  'extremal behavior of a graph invariant',
                  'classification robustness when lighting changes',
                ]).map((item) => (
                  <button key={item} type="button" className="qb-suggest" onClick={() => updateField('phenomenon', item)}>
                    {item}
                  </button>
                ))}
              </div>
              {preset?.questionHints && (
                <p className="qb-annotation">
                  Field vocabulary to consider: {preset.questionHints.join(' · ')}
                </p>
              )}
            </fieldset>
          )}

          {stage.id === 'relationship' && (
            <fieldset className="qb-fieldset">
              <legend>Name the relationship you want to study</legend>
              <div className="qb-grid-2">
                <div>
                  <label className="qb-label" htmlFor={`${baseId}-factor`}>
                    {preset?.factorLabel || 'What might affect or explain the phenomenon?'}
                  </label>
                  <input
                    id={`${baseId}-factor`}
                    className="qb-input"
                    value={state.factor}
                    onChange={(event) => updateField('factor', event.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="qb-label" htmlFor={`${baseId}-outcome`}>
                    {preset?.outcomeLabel || 'What could you actually observe or measure?'}
                  </label>
                  <input
                    id={`${baseId}-outcome`}
                    className="qb-input"
                    value={state.outcome}
                    onChange={(event) => updateField('outcome', event.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
              <label className="qb-label" htmlFor={`${baseId}-context`}>
                In what population, system, dataset, environment, or mathematical setting?
              </label>
              <input
                id={`${baseId}-context`}
                className="qb-input"
                value={state.context}
                onChange={(event) => updateField('context', event.target.value)}
                aria-describedby={`${baseId}-context-help`}
                autoComplete="off"
              />
              <p id={`${baseId}-context-help`} className="qb-helper">
                Bound the setting. A generic context makes the question too broad.
              </p>
              {(preset?.contextExamples || []).length > 0 && (
                <div className="qb-suggestions" aria-label="Context examples">
                  {preset.contextExamples.map((item) => (
                    <button key={item} type="button" className="qb-suggest" onClick={() => updateField('context', item)}>
                      {item}
                    </button>
                  ))}
                </div>
              )}
              <label className="qb-label" htmlFor={`${baseId}-comparison`}>
                Is there a useful comparison or baseline? <span className="qb-optional">(optional)</span>
              </label>
              <input
                id={`${baseId}-comparison`}
                className="qb-input"
                value={state.comparison}
                onChange={(event) => updateField('comparison', event.target.value)}
                autoComplete="off"
              />
            </fieldset>
          )}

          {stage.id === 'evidence' && (
            <fieldset className="qb-fieldset">
              <legend>What evidence could support or challenge the question?</legend>
              <label className="qb-label" htmlFor={`${baseId}-evidence`}>Evidence source</label>
              <input
                id={`${baseId}-evidence`}
                className="qb-input"
                value={state.evidenceSource}
                onChange={(event) => updateField('evidenceSource', event.target.value)}
                autoComplete="off"
              />
              <div className="qb-suggestions" aria-label="Evidence source suggestions">
                {evidenceSuggestions.map((item) => (
                  <button key={item} type="button" className="qb-suggest" onClick={() => updateField('evidenceSource', item)}>
                    {item}
                  </button>
                ))}
              </div>

              <label className="qb-label" htmlFor={`${baseId}-access`}>Evidence access</label>
              <select
                id={`${baseId}-access`}
                className="qb-select"
                value={state.evidenceAccess}
                onChange={(event) => updateField('evidenceAccess', event.target.value)}
              >
                <option value="">Select access level</option>
                {EVIDENCE_ACCESS_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <label className="qb-label" htmlFor={`${baseId}-method`}>Method type</label>
              <input
                id={`${baseId}-method`}
                className="qb-input"
                value={state.methodType}
                onChange={(event) => updateField('methodType', event.target.value)}
                list={`${baseId}-method-list`}
                autoComplete="off"
              />
              <datalist id={`${baseId}-method-list`}>
                {methodSuggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <div className="qb-suggestions" aria-label="Method suggestions">
                {methodSuggestions.map((item) => (
                  <button key={item} type="button" className="qb-suggest" onClick={() => updateField('methodType', item)}>
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {stage.id === 'scope' && (
            <fieldset className="qb-fieldset">
              <legend>Bound the project so it can actually be attempted</legend>
              <label className="qb-label" htmlFor={`${baseId}-time`}>Time available</label>
              <select
                id={`${baseId}-time`}
                className="qb-select"
                value={state.timeAvailable}
                onChange={(event) => updateField('timeAvailable', event.target.value)}
              >
                <option value="">Select a time window</option>
                {TIME_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <label className="qb-label" htmlFor={`${baseId}-smallest`}>
                What is the smallest version of this problem that would still teach you something?
              </label>
              <textarea
                id={`${baseId}-smallest`}
                className="qb-textarea"
                rows={3}
                value={state.smallestVersion}
                onChange={(event) => updateField('smallestVersion', event.target.value)}
                aria-describedby={`${baseId}-smallest-help`}
              />
              <p id={`${baseId}-smallest-help`} className="qb-helper">
                This field is critical. Define a version that could fail informatively.
              </p>

              <label className="qb-label" htmlFor={`${baseId}-constraint`}>Main constraint</label>
              <input
                id={`${baseId}-constraint`}
                className="qb-input"
                value={state.mainConstraint}
                onChange={(event) => updateField('mainConstraint', event.target.value)}
                autoComplete="off"
              />
            </fieldset>
          )}

          {generated.diagnostics.warnings.length > 0 && (
            <div className="qb-warnings" role="status">
              <p className="qb-warnings-title">Scope check</p>
              <ul>
                {generated.diagnostics.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        <div className="qb-nav-actions">
          <button
            type="button"
            className="button secondary"
            disabled={stageIndex === 0}
            onClick={() => setStageIndex((value) => Math.max(0, value - 1))}
          >
            Back
          </button>
          <button
            type="button"
            className="button primary"
            disabled={stageIndex === STAGES.length - 1}
            onClick={() => setStageIndex((value) => Math.min(STAGES.length - 1, value + 1))}
          >
            Next
          </button>
        </div>
        </div>

        <aside className="qb-preview" aria-label="Live research record">
          <div className="qb-preview-sticky">
            <p className="qb-preview-kicker">Live question</p>
            <p className="qb-status-label">{generated.statusLabel}</p>
            <p
              className="qb-live-question"
              aria-live="polite"
              aria-atomic="true"
            >
              {liveRegionText || (generated.primary?.text || 'Fill the stages to form a draft question. Empty fields stay blank rather than inventing wording.')}
            </p>
            <p className="qb-question-type">{generated.questionType}</p>

            {generated.diagnostics.missingPieces.length > 0 && (
              <div className="qb-missing">
                <p className="qb-panel-label">Needs work</p>
                <ul>
                  {generated.diagnostics.missingPieces.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="qb-next-box">
              <p className="qb-panel-label">Next</p>
              <p>{generated.nextImprovement}</p>
            </div>

            {generated.candidates.length > 1 && (
              <div className="qb-candidates">
                <p className="qb-panel-label">Candidate structures</p>
                <ol>
                  {generated.candidates.map((item) => (
                    <li key={`${item.id}-${item.text}`}>
                      <span>{item.type}</span>
                      <p>{item.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <LogicDiagram state={state} />

            <section className="qb-diagnostic" aria-labelledby={`${baseId}-diagnostic-title`}>
              <h3 id={`${baseId}-diagnostic-title`}>First-draft diagnostic</h3>
              <p className="qb-diagnostic-note">
                These indicators explain the draft from your visible inputs. They do not certify research quality.
              </p>
              <p className="qb-overall">Overall: {generated.diagnostics.overallStatus}</p>
              <ul className="qb-diagnostic-list">
                {generated.diagnostics.dimensions.map((dimension) => {
                  const open = expandedDiagnostic === dimension.id
                  return (
                    <li key={dimension.id}>
                      <button
                        type="button"
                        className="qb-diagnostic-row"
                        aria-expanded={open}
                        onClick={() => setExpandedDiagnostic(open ? null : dimension.id)}
                      >
                        <span className="qb-diagnostic-name">{dimension.label}</span>
                        <DiagnosticBar score={dimension.score} />
                        <span className="qb-diagnostic-status">{dimension.status}</span>
                      </button>
                      {open && (
                        <div className="qb-diagnostic-detail">
                          <p>{dimension.reason}</p>
                          <p><strong>Next:</strong> {dimension.next}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>

            <div className="qb-preview-actions">
              <button type="button" className="button secondary" onClick={handleCopyQuestion}>Copy Question</button>
              <button type="button" className="button secondary" onClick={handleCopyRecord}>Copy Research Record</button>
              <button type="button" className="button primary" onClick={openWorksheetFlow}>Open Worksheet</button>
              <Link className="qb-text-link" to="/worksheet">Go to worksheet page</Link>
            </div>

            {worksheetChoice === 'choose' && (
              <div className="qb-worksheet-choice" role="region" aria-label="Worksheet import choice">
                <p>Your worksheet already has content. Choose how to proceed:</p>
                <button type="button" className="button secondary" onClick={() => setWorksheetChoice(null)}>
                  Keep existing worksheet
                </button>
                <button type="button" className="button primary" onClick={() => importBuilderDraft(true)}>
                  Import builder draft
                </button>
                <Link className="button ghost" to="/worksheet">Open worksheet without changing it</Link>
              </div>
            )}

            {copyNote && <p className="qb-copy-note" role="status">{copyNote}</p>}
            {fallbackText && (
              <label className="qb-fallback">
                <span>Copy this text manually</span>
                <textarea readOnly rows={8} value={fallbackText} />
              </label>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

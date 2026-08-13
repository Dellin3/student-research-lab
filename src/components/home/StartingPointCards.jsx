import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  readResearchRecord,
  saveResearchRecord,
} from '../../utils/researchRecord.js'

const directions = [
  ['observe', 'Observe', 'Describe a pattern or behavior carefully.'],
  ['compare', 'Compare', 'Look for a meaningful difference between cases.'],
  ['compute', 'Compute', 'Use data or a model to calculate a relationship.'],
  ['prove', 'Prove', 'Test a mathematical claim through examples and proof.'],
  ['measure', 'Measure', 'Define a quantity and record how it changes.'],
]

function saveStartingPoint({ interest, direction, focus }) {
  const current = readResearchRecord(window.localStorage)
  saveResearchRecord({
    ...current,
    startingPoint: {
      ...current.startingPoint,
      interest: interest.trim(),
      direction,
      phenomenon: focus.trim(),
    },
    next: {
      ...current.next,
      action: 'Read two credible sources and refine this starting point into a specific question.',
    },
  }, window.localStorage)
}

export default function StartingPointCards() {
  const [step, setStep] = useState(1)
  const [interest, setInterest] = useState('')
  const [direction, setDirection] = useState('observe')
  const [focus, setFocus] = useState('')
  const [status, setStatus] = useState('')

  const directionLabel = directions.find(([key]) => key === direction)?.[1] || 'Observe'
  const canContinue = interest.trim().length > 1
  const canSave = canContinue && focus.trim().length > 1

  const handleSave = () => {
    try {
      saveStartingPoint({ interest, direction: directionLabel, focus })
      setStatus('Starting point saved in your Research Record.')
    } catch {
      setStatus('This browser could not save your starting point. You can still continue to the builder.')
    }
  }

  return (
    <section className="try-research-section" aria-labelledby="try-research-title">
      <div className="home-shell try-research-layout">
        <div className="try-research-intro">
          <p className="home-kicker">Try Research Now</p>
          <h2 id="try-research-title">Make one rough starting point.</h2>
          <p>
            This does not judge or interpret your idea. It simply gives you a
            structure you can revise after reading and testing.
          </p>
          <p className="privacy-line">Nothing is saved until you choose “Keep this starting point.”</p>
        </div>

        <form className="starting-point-tool" onSubmit={(event) => event.preventDefault()}>
          <div className="tool-progress" aria-label={`Step ${step} of 2`}>
            <span className="is-complete">1</span><i /><span className={step === 2 ? 'is-complete' : ''}>2</span>
          </div>

          {step === 1 ? (
            <div className="tool-step">
              <p className="home-meta">Step 1 · Interest</p>
              <label htmlFor="home-interest">What keeps catching your attention?</label>
              <textarea
                id="home-interest"
                rows="4"
                value={interest}
                onChange={(event) => setInterest(event.target.value)}
                placeholder="Example: how city trees change street temperatures"
              />
              <button
                className="button primary"
                type="button"
                disabled={!canContinue}
                onClick={() => setStep(2)}
              >
                Choose a direction
              </button>
            </div>
          ) : (
            <div className="tool-step">
              <p className="home-meta">Step 2 · Direction</p>
              <fieldset>
                <legend>What kind of move could you try first?</legend>
                <div className="direction-options">
                  {directions.map(([key, label, description]) => (
                    <label className={direction === key ? 'is-selected' : ''} key={key}>
                      <input
                        type="radio"
                        name="direction"
                        value={key}
                        checked={direction === key}
                        onChange={() => setDirection(key)}
                      />
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label htmlFor="home-direction-focus">Finish the direction in your own words.</label>
              <textarea
                id="home-direction-focus"
                rows="3"
                value={focus}
                onChange={(event) => {
                  setFocus(event.target.value)
                  setStatus('')
                }}
                placeholder={`${directionLabel}…`}
              />
              <div className="tool-actions">
                <button className="button secondary" type="button" onClick={() => setStep(1)}>Back</button>
                <button className="button primary" type="button" disabled={!canSave} onClick={handleSave}>
                  Keep this starting point
                </button>
              </div>
              <p className="save-status" aria-live="polite">{status}</p>
              <Link className="builder-link" to="/topic-narrowing">
                Continue to Topic Narrowing Lab <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

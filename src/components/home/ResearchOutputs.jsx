import { Link } from 'react-router-dom'

const recordSections = [
  ['Current question', 'Keep the question you are testing now—not the first version forever.'],
  ['Sources', 'Record what each source contributes and where its limits begin.'],
  ['Unresolved ideas', 'Keep vocabulary, contradictions, and assumptions visible.'],
  ['Smallest test', 'Name the next model, proof attempt, observation, or comparison.'],
  ['Evidence', 'Attach results, null findings, errors, and context.'],
  ['Revision history', 'Date important changes and explain what prompted them.'],
  ['Next action', 'Choose one concrete task small enough to begin.'],
]

export default function ResearchOutputs() {
  return (
    <section className="record-section" aria-labelledby="record-title">
      <div className="home-shell record-layout">
        <div className="record-copy">
          <p className="home-kicker">Your Research Record</p>
          <h2 id="record-title">Keep the reasoning, not just the result.</h2>
          <p>
            A living record helps you continue after a confusing result, ask
            for focused feedback, and explain how the project changed.
          </p>
          <Link className="button primary" to="/worksheet">Open your Research Record</Link>
          <small>Saved worksheet entries stay in this browser.</small>
        </div>

        <div className="record-preview" aria-label="Preview of the Research Record">
          <header>
            <div>
              <span>RESEARCH RECORD</span>
              <strong>Project workspace</strong>
            </div>
            <span className="record-state">Draft</span>
          </header>
          <div className="record-question">
            <span>Current question</span>
            <p>Your current question will stay visible here as it changes.</p>
          </div>
          <div className="record-index">
            {recordSections.slice(1).map(([title, description]) => (
              <div key={title}>
                <span>{title}</span>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

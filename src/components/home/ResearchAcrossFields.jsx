import { Link } from 'react-router-dom'

const fields = [
  {
    name: 'Mathematics',
    mode: 'Define objects, test examples, find structure, and prove or disprove a claim.',
    example: 'Which local graph conditions guarantee that a network remains connected?',
  },
  {
    name: 'Computer Science',
    mode: 'Design an algorithm or system, specify a benchmark, and compare behavior under constraints.',
    example: 'How does image compression change the accuracy and speed of a small classifier?',
  },
  {
    name: 'Biology / Environment',
    mode: 'Observe a living or environmental system, define variables, and use ethical measurements.',
    example: 'How does shade relate to soil-moisture change across several schoolyard locations?',
  },
  {
    name: 'Social Science',
    mode: 'Operationalize a human question, choose responsible evidence, and state limits carefully.',
    example: 'How does question order change responses in a short anonymous school survey?',
  },
  {
    name: 'Physics',
    mode: 'Simplify a physical system, model a relationship, and compare predictions with measurements.',
    example: 'How does pendulum amplitude affect the accuracy of the small-angle period model?',
  },
]

export default function ResearchAcrossFields() {
  return (
    <section className="fields-section" aria-labelledby="fields-title">
      <div className="home-shell">
        <div className="section-heading fields-heading">
          <p className="home-kicker">Research Across Fields</p>
          <h2 id="fields-title">Different methods. The same honest loop.</h2>
          <p>
            Research can produce a proof, program, observation, analysis,
            experiment, or model. No field is the default.
          </p>
        </div>

        <div className="field-grid">
          {fields.map((field, index) => (
            <article className="field-mode" key={field.name}>
              <span className="field-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{field.name}</h3>
              <p>{field.mode}</p>
              <div className="worked-example">
                <span>WORKED EXAMPLE</span>
                <p>{field.example}</p>
              </div>
              {field.name === 'Physics' && (
                <div className="real-example">
                  <span>REAL PROJECT EXAMPLE</span>
                  <p>One student pathway uses Cassini observations of Saturn’s rings to develop an inspectable mathematical question.</p>
                  <Link to="/case-studies">View the small case note <span aria-hidden="true">→</span></Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

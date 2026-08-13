import { Link } from 'react-router-dom'

const startingChoices = {
  direction: {
    label: 'I have an interest, but no direction',
    recommendation: 'Turn the interest into one bounded research direction.',
    explanation: 'A useful direction names an object, a way of looking, and a boundary. The question comes next.',
    action: 'Narrow a direction',
    link: '/topic-narrowing',
  },
  question: {
    label: 'I have a topic, but no question',
    recommendation: 'Turn the topic into a comparison, measurement, computation, or proof attempt.',
    explanation: 'A question becomes workable when it points toward evidence that could change your answer.',
    action: 'Build a research question',
    link: '/research-question-builder',
  },
  test: {
    label: 'I have a question, but no project',
    recommendation: 'Design the smallest test that could reveal one useful result.',
    explanation: 'Start with an inspectable attempt, then let its limits guide the next version.',
    action: 'Build the smallest test',
    link: '/build-a-project',
  },
}

export default function HomeHero({ stuckAt, onStuckChange }) {
  const choice = startingChoices[stuckAt]

  return (
    <section className="home-hero home-shell" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <p className="home-kicker">A free, practical pathway for student research</p>
        <h1 id="home-title">How to Start a Research Project in High School</h1>
        <p className="home-hero-lead">
          Begin with curiosity, learn enough to notice a real uncertainty, and
          make the smallest piece of work that can teach you what to do next.
          This guide connects reading, questions, evidence, revision, and a
          research record you can keep using.
        </p>
      </div>

      <form className="stuck-finder" onSubmit={(event) => event.preventDefault()}>
        <fieldset>
          <legend>Where are you stuck?</legend>
          <div className="stuck-options">
            {Object.entries(startingChoices).map(([key, item]) => (
              <label className={stuckAt === key ? 'is-selected' : ''} key={key}>
                <input
                  type="radio"
                  name="home-start"
                  value={key}
                  checked={stuckAt === key}
                  onChange={() => onStuckChange(key)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="stuck-recommendation" aria-live="polite">
          <p className="home-meta">Recommended next move</p>
          <strong>{choice.recommendation}</strong>
          <p>{choice.explanation}</p>
          <Link className="button primary" to={choice.link}>{choice.action}</Link>
        </div>
      </form>
    </section>
  )
}

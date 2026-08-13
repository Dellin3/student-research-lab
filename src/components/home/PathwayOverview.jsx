import { useState } from 'react'
import { Link } from 'react-router-dom'

const stages = [
  {
    title: 'Interest',
    happens: 'Notice a subject, pattern, or problem that keeps pulling you back.',
    produced: 'A plain-language interest statement',
    mistake: 'Choosing a topic only because it sounds impressive.',
    link: '/find-a-direction',
  },
  {
    title: 'Direction',
    happens: 'Narrow the interest to a phenomenon, system, population, or relationship.',
    produced: 'A bounded direction worth reading about',
    mistake: 'Treating a whole discipline as a research topic.',
    link: '/find-a-direction',
  },
  {
    title: 'Literature',
    happens: 'Learn vocabulary, trace claims to original sources, and record disagreements.',
    produced: 'A small source map with unresolved ideas',
    mistake: 'Collecting links without noting what each source contributes.',
    link: '/ai-literature',
  },
  {
    title: 'Question',
    happens: 'Turn a durable uncertainty into something you can compare, measure, compute, or prove.',
    produced: 'Several specific question drafts',
    mistake: 'Writing a question whose answer is already assumed.',
    link: '/research-question-builder',
  },
  {
    title: 'Smallest Test',
    happens: 'Build the least complicated attempt that preserves the idea you need to inspect.',
    produced: 'A toy model, proof attempt, protocol, or analysis',
    mistake: 'Building the full project before checking the central assumption.',
    link: '/build-a-project',
  },
  {
    title: 'Evidence',
    happens: 'Document what happened, including null results, errors, and limits.',
    produced: 'An inspectable result and evidence notes',
    mistake: 'Keeping only observations that support the first idea.',
    link: '/build-a-project',
  },
  {
    title: 'Revision',
    happens: 'Use the evidence to change the question, method, or smallest test.',
    produced: 'A dated decision and a better next version',
    mistake: 'Calling every change a failure instead of recording what it taught.',
    link: '/research-workflow',
  },
  {
    title: 'Output',
    happens: 'Make the question, method, evidence, limitations, and next steps visible.',
    produced: 'A paper, poster, notebook, model, dataset, or tool',
    mistake: 'Presenting the final answer without the reasoning trail.',
    link: '/worksheet',
  },
]

const recommendedIndexes = { direction: 1, question: 3, test: 4 }

export default function PathwayOverview({ recommendedStage }) {
  const recommendedIndex = recommendedIndexes[recommendedStage] ?? 0
  const [activeIndex, setActiveIndex] = useState(recommendedIndex)
  const active = stages[activeIndex]

  return (
    <section className="research-map-section" aria-labelledby="research-map-heading">
      <div className="home-shell">
        <div className="section-heading map-heading">
          <p className="home-kicker">The Research Map</p>
          <h2 id="research-map-heading">Eight moves, with revision built in.</h2>
          <p>
            Use this as a map, not a rule. Select any node to inspect the work
            at that stage. Evidence often sends a project backward before it
            moves forward.
          </p>
        </div>

        <div className="research-map-layout">
          <div className="map-plot">
            <svg
              className="map-path"
              viewBox="0 0 1000 420"
              role="img"
              aria-labelledby="map-svg-title map-svg-desc"
            >
              <title id="map-svg-title">Eight-stage research map</title>
              <desc id="map-svg-desc">
                A path from interest through output, with a visible revision
                loop returning from revision to the question and smallest test.
              </desc>
              <path className="map-main-line" d="M70 102H930" />
              <path className="map-loop-line" d="M806 102C806 330 438 330 438 102" />
              <path className="map-loop-arrow" d="M438 102l-12 20 24-2" />
              <text x="590" y="286">revise the question or test</text>
            </svg>
            <ol className="map-nodes">
              {stages.map((stage, index) => (
                <li
                  className={[
                    activeIndex === index ? 'is-active' : '',
                    recommendedIndex === index ? 'is-recommended' : '',
                    index === 6 ? 'is-revision' : '',
                  ].filter(Boolean).join(' ')}
                  key={stage.title}
                >
                  <button
                    type="button"
                    aria-pressed={activeIndex === index}
                    onClick={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {stage.title}
                    {recommendedIndex === index && <small>Recommended</small>}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <article className="map-detail-panel" aria-labelledby="active-map-stage">
            <p className="home-meta">Stage {String(activeIndex + 1).padStart(2, '0')}</p>
            <h3 id="active-map-stage">{active.title}</h3>
            <dl>
              <div><dt>What happens</dt><dd>{active.happens}</dd></div>
              <div><dt>What you produce</dt><dd>{active.produced}</dd></div>
              <div><dt>Common mistake</dt><dd>{active.mistake}</dd></div>
            </dl>
            <Link to={active.link}>Continue from {active.title} <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </div>
    </section>
  )
}

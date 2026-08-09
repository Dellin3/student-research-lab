import { Link } from 'react-router-dom'
import useInViewOnce from './useInViewOnce.js'

const startingPoints = [
  {
    number: '01',
    title: 'I have an interest, but no research topic.',
    text: 'Turn a broad subject into a narrower phenomenon, variable, or system worth investigating.',
    link: '/find-a-direction',
    action: 'Find a direction',
    motif: 'narrow',
  },
  {
    number: '02',
    title: 'I have a topic, but no testable question.',
    text: 'Move from “I want to study this” toward something specific enough to measure, compare, model, or falsify.',
    link: '/research-workflow',
    action: 'Build the question',
    motif: 'question',
  },
  {
    number: '03',
    title: 'I have a question, but I do not know how to build the project.',
    text: 'Choose evidence, make a minimal model or analysis, record assumptions, and create a first inspectable result.',
    link: '/build-a-project',
    action: 'Build the project',
    motif: 'build',
  },
]

function CardMotif({ type }) {
  if (type === 'narrow') {
    return (
      <svg viewBox="0 0 120 72" aria-hidden="true">
        <circle className="micro-broad" cx="18" cy="36" r="13" />
        <circle className="micro-middle" cx="60" cy="36" r="9" />
        <circle className="micro-focus" cx="101" cy="36" r="5" />
        <path className="micro-path" d="M31 36h20M69 36h27" />
      </svg>
    )
  }

  if (type === 'question') {
    return (
      <svg viewBox="0 0 120 72" aria-hidden="true">
        <path className="micro-axis" d="M12 56h96" />
        <path className="micro-wander" d="M20 49l20-19 20 8 20-25 20 13" />
        <circle className="micro-answer" cx="80" cy="13" r="4" />
        <path className="micro-resolve" d="M79 47c8-2 14-8 14-15" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 72" aria-hidden="true">
      <rect className="micro-frame" x="13" y="12" width="39" height="48" />
      <path className="micro-evidence" d="M22 24h21M22 34h15M22 44h18" />
      <circle className="micro-check-ring" cx="83" cy="35" r="18" />
      <path className="micro-check" d="M72 37l8 8 16-20" />
    </svg>
  )
}

export default function StartingPointCards() {
  const [sectionRef, isVisible] = useInViewOnce({ threshold: 0.14 })

  return (
    <section
      className={`home-section home-starting-points reveal-ready${isVisible ? ' is-revealed' : ''}`}
      aria-labelledby="starting-point-title"
      data-reveal="rise"
      ref={sectionRef}
    >
      <div className="home-section-heading">
        <p className="eyebrow">Start where you actually are</p>
        <h2 id="starting-point-title">You do not need to begin at step one.</h2>
        <p>
          Research paths are rarely linear. Choose the problem that is blocking
          you now.
        </p>
      </div>
      <div className="starting-point-grid">
        {startingPoints.map((point) => (
          <article className={`starting-card starting-card-${point.number}`} key={point.number}>
            <span className="starting-index-tab" aria-hidden="true">{point.number}</span>
            <span className="starting-corner-mark" aria-hidden="true" />
            <div className="starting-card-topline">
              <span>{point.number}</span>
              <CardMotif type={point.motif} />
            </div>
            <span className="starting-card-label" aria-hidden="true">
              {point.number === '03' ? 'FIELD NOTE / BUILD' : `RESEARCH NOTE / ${point.number}`}
            </span>
            <h3>{point.title}</h3>
            <p>{point.text}</p>
            <Link to={point.link}>
              {point.action} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

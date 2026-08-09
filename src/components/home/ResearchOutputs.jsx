import useInViewOnce from './useInViewOnce.js'

const outputs = [
  {
    title: 'Research record',
    text: 'A written trace of what you believed, tested, and changed.',
    icon: 'record',
    example: 'Aug 06 — assumption revised',
  },
  {
    title: 'Source map',
    text: 'A small collection of credible sources connected to specific questions.',
    icon: 'sources',
    example: '3 sources → 1 unresolved claim',
  },
  {
    title: 'Inspectable artifact',
    text: 'A model, analysis, dataset, proof attempt, experiment, or reproducible result.',
    icon: 'artifact',
    example: 'result_03 / confidence noted',
  },
  {
    title: 'Next-step memo',
    text: 'What failed, what remains uncertain, and what you would test next.',
    icon: 'memo',
    example: 'Next test → isolate one variable',
  },
]

function OutputIcon({ type }) {
  return (
    <svg viewBox="0 0 180 100" aria-hidden="true">
      {type === 'record' && <><path d="M18 18h144v64H18zM34 34h92M34 48h112M34 62h78" /><path className="artifact-accent-line" d="M132 34h17" /></>}
      {type === 'sources' && <><circle cx="35" cy="52" r="11" /><circle cx="92" cy="28" r="9" /><circle cx="142" cy="62" r="12" /><path d="M46 48l37-16M101 34l31 21M47 57l83 6" /><circle className="artifact-accent-fill" cx="92" cy="28" r="3" /></>}
      {type === 'artifact' && <><path d="M18 80h145M24 76l28-30 24 13 31-38 24 26 28-17" /><circle cx="107" cy="21" r="5" /><path className="artifact-grid-line" d="M24 22v54M59 22v54M94 22v54M129 22v54" /></>}
      {type === 'memo' && <><path d="M21 18h138v64H67L45 94l5-12H21zM39 37h94M39 52h72M39 67h41" /><path className="artifact-accent-line" d="M117 67h20" /></>}
    </svg>
  )
}

export default function ResearchOutputs() {
  const [sectionRef, isVisible] = useInViewOnce({ threshold: 0.16 })

  return (
    <section
      className={`home-section home-outputs reveal-ready${isVisible ? ' is-revealed' : ''}`}
      aria-labelledby="outputs-title"
      data-reveal="rise"
      ref={sectionRef}
    >
      <div className="home-section-heading">
        <p className="eyebrow">What you leave with</p>
        <h2 id="outputs-title">Finish with evidence of your thinking.</h2>
        <p>
          The value of a project is not only its conclusion. It is the record
          that lets someone else understand how you arrived there.
        </p>
      </div>
      <div className="output-portfolio">
        {outputs.map((output, index) => (
          <article
            className={`output-artifact artifact-${output.icon}`}
            tabIndex="0"
            key={output.title}
          >
            <header>
              <span className="output-number">{String(index + 1).padStart(2, '0')}</span>
              <span>PORTFOLIO ARTIFACT</span>
            </header>
            <div className="artifact-preview">
              <OutputIcon type={output.icon} />
              <small>{output.example}</small>
            </div>
            <div className="artifact-copy"><h3>{output.title}</h3><p>{output.text}</p></div>
          </article>
        ))}
      </div>
    </section>
  )
}

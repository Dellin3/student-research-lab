import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useInViewOnce from './useInViewOnce.js'

const stages = [
  {
    title: 'Interest',
    description: 'Notice the subject, pattern, or problem you return to without being assigned.',
    output: 'An honest interest statement',
    link: '/find-a-direction',
  },
  {
    title: 'Focused Field',
    description: 'Narrow a broad subject to a field, subfield, and concrete phenomenon.',
    output: 'A bounded direction',
    link: '/find-a-direction',
  },
  {
    title: 'Sources',
    description: 'Learn the vocabulary and trace important claims back to credible original work.',
    output: 'A small source map',
    link: '/ai-literature',
  },
  {
    title: 'Expert Thinking',
    description: 'Look for the methods, assumptions, comparisons, and limitations experts repeat.',
    output: 'A list of field patterns',
    link: '/ai-literature',
  },
  {
    title: 'Questions',
    description: 'Turn persistent confusion into something specific enough to test or challenge.',
    output: 'Several question drafts',
    link: '/research-workflow',
  },
  {
    title: 'Toy Model',
    description: 'Build the smallest version that preserves the mechanism you want to understand.',
    output: 'A first inspectable attempt',
    link: '/build-a-project',
  },
  {
    title: 'Data',
    description: 'Find evidence you can inspect, document, compare, and use responsibly.',
    output: 'A documented evidence plan',
    link: '/build-a-project',
  },
  {
    title: 'Mentor Feedback',
    description: 'Ask a well-matched person a focused question grounded in work you have already done.',
    output: 'Specific outside critique',
    link: '/outreach',
  },
  {
    title: 'Revision',
    description: 'Change the question, model, or method in response to what the evidence exposed.',
    output: 'A dated decision record',
    link: '/research-workflow',
  },
  {
    title: 'Output',
    description: 'Make your question, method, evidence, limitations, and next steps visible to others.',
    output: 'A paper, poster, notebook, model, or tool',
    link: '/build-a-project',
  },
]

const stagePoints = [
  [220, 90],
  [780, 235],
  [220, 380],
  [780, 525],
  [220, 670],
  [780, 815],
  [220, 960],
  [780, 1105],
  [220, 1250],
  [780, 1435],
]

function StageSymbol({ index }) {
  const type = index % 5
  return (
    <span className="roadmap-symbol" aria-hidden="true">
      <svg viewBox="0 0 46 46">
        {type === 0 && <><circle cx="23" cy="23" r="12" /><path d="M23 5v6M23 35v6M5 23h6M35 23h6" /></>}
        {type === 1 && <><path d="M8 12h30M12 22h22M16 32h14" /><circle cx="38" cy="12" r="3" /></>}
        {type === 2 && <><rect x="8" y="9" width="28" height="30" /><path d="M14 17h16M14 24h11M14 31h14" /></>}
        {type === 3 && <><path d="M7 34l10-12 8 6 13-17" /><circle cx="38" cy="11" r="4" /><path d="M7 39h32" /></>}
        {type === 4 && <><path d="M9 14c8-7 20-7 28 0M37 32c-8 7-20 7-28 0" /><path d="M34 9l4 5-6 2M12 37l-4-5 6-2" /></>}
      </svg>
    </span>
  )
}

export default function PathwayOverview() {
  const [sectionRef, isVisible] = useInViewOnce({ threshold: 0.06 })
  const itemRefs = useRef([])
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      () => {
        const focusY = window.innerHeight * 0.46
        const closest = itemRefs.current
          .filter(Boolean)
          .map((item) => ({
            index: Number(item.dataset.stage),
            distance: Math.abs(
              item.getBoundingClientRect().top +
              item.getBoundingClientRect().height / 2 -
              focusY,
            ),
          }))
          .sort((a, b) => a.distance - b.distance)[0]

        if (closest) setActiveStage(closest.index)
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.15, 0.35, 0.6] },
    )

    itemRefs.current.forEach((item) => item && observer.observe(item))
    return () => observer.disconnect()
  }, [])

  const lightPosition = `${8 + (activeStage / (stages.length - 1)) * 84}%`
  const pathProgress = Math.max(0.1, (activeStage + 1) / stages.length)
  const [markerX, markerY] = stagePoints[activeStage]

  return (
    <section
      className={`home-section home-pathway-overview${isVisible ? ' is-pathway-visible' : ''}`}
      aria-labelledby="pathway-title"
      ref={sectionRef}
      style={{ '--path-light-y': lightPosition }}
    >
      <span className="pathway-boundary-mark" aria-hidden="true">FIELD COORDINATES / 01—10</span>
      <div className="home-section-heading">
        <p className="eyebrow">The pathway</p>
        <h2 id="pathway-title">A research project is a sequence of better questions.</h2>
        <p>
          Move forward when you can, and return when new evidence changes what
          you thought you knew.
        </p>
      </div>
      <div className="roadmap-field">
        <svg className="roadmap-trail" viewBox="0 0 1000 1580" preserveAspectRatio="none" aria-hidden="true">
          <path
            className="roadmap-trail-base"
            pathLength="1"
            d="M220 90 C470 90 535 235 780 235 S470 380 220 380 S535 525 780 525 S470 670 220 670 S535 815 780 815 S470 960 220 960 S535 1105 780 1105 S470 1250 220 1250 S535 1435 780 1435"
          />
          <path
            className="roadmap-trail-active"
            pathLength="1"
            strokeDasharray={`${pathProgress} 1`}
            d="M220 90 C470 90 535 235 780 235 S470 380 220 380 S535 525 780 525 S470 670 220 670 S535 815 780 815 S470 960 220 960 S535 1105 780 1105 S470 1250 220 1250 S535 1435 780 1435"
          />
          <path className="roadmap-return-loop" d="M220 1250 C925 1230 925 730 220 670" />
          <path className="roadmap-return-arrow" d="M220 670l24-7-8 22" />
          <g
            className="roadmap-current-marker"
            style={{ '--marker-x': `${markerX}px`, '--marker-y': `${markerY}px` }}
          >
            <circle className="marker-glow" r="16" />
            <circle className="marker-ring" r="7" />
            <circle className="marker-core" r="2.5" />
          </g>
        </svg>
        <span className="roadmap-annotation annotation-question" aria-hidden="true">question changes here</span>
        <span className="roadmap-annotation annotation-revision" aria-hidden="true">evidence changes the question</span>
        <ol className="home-roadmap">
          {stages.map((stage, index) => (
            <li
              className={[
                'roadmap-item',
                activeStage === index ? 'is-active' : index < activeStage ? 'is-past' : 'is-future',
                index === activeStage - 1 ? 'is-previous' : '',
                index === 8 ? 'is-revision' : '',
                index === 9 ? 'is-output' : '',
              ].filter(Boolean).join(' ')}
              data-stage={index}
              ref={(item) => { itemRefs.current[index] = item }}
              key={stage.title}
            >
              <Link to={stage.link}>
                <span className="roadmap-number">{String(index + 1).padStart(2, '0')}</span>
                <StageSymbol index={index} />
                <span className="roadmap-copy">
                  <h3>{stage.title}</h3>
                  <span>{stage.description}</span>
                  <span className="roadmap-output">
                    <b>What you produce:</b> {stage.output}
                  </span>
                  <span className="roadmap-next">
                    {index < stages.length - 1
                      ? `Next: ${stages[index + 1].title}`
                      : 'Then share what you learned'}
                    <i aria-hidden="true">→</i>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <span className="pathway-exit-node" aria-hidden="true"><i />OUTPUT / 10</span>
    </section>
  )
}

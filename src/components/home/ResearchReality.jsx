import { useEffect, useState } from 'react'
import useInViewOnce from './useInViewOnce.js'

let researchStoryHasPlayed = false

const MESSY_PATH =
  'M38 46 C83 39 111 65 154 76 S228 62 262 42 C304 18 344 68 372 104 C411 154 351 187 300 190 S202 143 166 166 C127 191 101 218 74 236 C38 261 128 290 202 280 S305 226 350 242 C402 261 384 302 416 326 C443 347 355 370 282 360'
const MESSY_RETURN = 'M302 354c-33-38-48-77-28-116'
const MESSY_ARROW = 'M267 248l8-11 5 13'

const messySteps = [
  ['Interest', 38, 46],
  ['reading', 154, 76],
  ['confusion', 262, 42],
  ['question', 372, 104],
  ['failed attempt', 300, 190],
  ['new source', 166, 166],
  ['revised question', 74, 236],
  ['small result', 202, 280],
  ['mentor feedback', 350, 242],
  ['revision', 416, 326],
  ['output', 282, 360],
]

export default function ResearchReality() {
  const [sectionRef, isVisible] = useInViewOnce({ threshold: 0.22 })
  const [storyState, setStoryState] = useState(
    researchStoryHasPlayed ? 'complete' : 'idle',
  )

  useEffect(() => {
    if (!isVisible || researchStoryHasPlayed) return undefined

    const startTimer = window.setTimeout(() => {
      researchStoryHasPlayed = true
      setStoryState('running')
    }, 0)
    const completeTimer = window.setTimeout(() => {
      researchStoryHasPlayed = true
      setStoryState('complete')
    }, 2450)

    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(completeTimer)
    }
  }, [isVisible])

  return (
    <section
      className={`home-section research-reality story-${storyState}${isVisible ? ' is-visible' : ''}`}
      aria-labelledby="research-reality-title"
      ref={sectionRef}
    >
      <div className="home-section-heading">
        <p className="eyebrow">The honest version</p>
        <h2 id="research-reality-title">Research is not a straight line.</h2>
      </div>
      <div className="reality-comparison">
        <article className="clean-version">
          <p className="reality-label">The clean version</p>
          <div className="clean-line" aria-label="Interest to question to method to result">
            <span>Interest</span><i>→</i><span>Question</span><i>→</i><span>Method</span><i>→</i><span>Result</span>
            <b className="clean-line-trace" aria-hidden="true" />
          </div>
          <p>Useful for a presentation. Rarely true while the work is happening.</p>
        </article>

        <article className="messy-version">
          <p className="reality-label">The version that actually happens</p>
          <span className="diagram-timestamp" aria-hidden="true">LOG 14:32 / REV 04</span>
          <span className="diagram-slip diagram-source-slip" aria-hidden="true">
            SOURCE 08<br />method unclear → reread
          </span>
          <span className="diagram-slip diagram-revision-slip" aria-hidden="true">
            REVISED QUESTION<br />compare one variable first
          </span>
          <span className="diagram-failed-note" aria-hidden="true">hypothesis v.1</span>
          <span className="diagram-feedback-note" aria-hidden="true">mentor: “show the assumption”</span>
          <svg
            viewBox="0 0 470 410"
            role="img"
            aria-labelledby="messy-title messy-description"
          >
            <title id="messy-title">The iterative path of a research project</title>
            <desc id="messy-description">
              A looping path through reading, confusion, failed attempts, new
              sources, feedback, revision, and a final output.
            </desc>
            <path
              className="messy-path"
              d={MESSY_PATH}
            />
            <path className="messy-return" d={MESSY_RETURN} />
            <path className="messy-arrow" d={MESSY_ARROW} />
            <path className="messy-path-tracer" d={MESSY_PATH} aria-hidden="true" />
            <path className="messy-return-tracer" d={MESSY_RETURN} aria-hidden="true" />
            <path className="messy-arrow-tracer" d={MESSY_ARROW} aria-hidden="true" />
            {messySteps.map(([label, x, y], index) => (
              <g className="messy-node" transform={`translate(${x} ${y})`} key={label}>
                <circle className="messy-node-shadow" cy="2" r={index === 0 || index === messySteps.length - 1 ? 9 : 7} />
                <circle className="messy-node-outer" r={index === 0 || index === messySteps.length - 1 ? 8 : 6} />
                <circle className="messy-node-center" r="2" />
                <text x="0" y="-13" textAnchor="middle">{label}</text>
              </g>
            ))}
          </svg>
        </article>
      </div>
      <p className="reality-thesis">
        Good research is not the absence of wrong turns. It is the ability to
        make those turns visible, testable, and useful.
      </p>
    </section>
  )
}

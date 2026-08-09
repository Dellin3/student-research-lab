import { useEffect, useRef, useState } from 'react'
import useInViewOnce from './useInViewOnce.js'

let heroIntroHasPlayed = false

const MAIN_TRAIL_PATH =
  'M86 88 C152 82 214 130 282 142 S410 164 430 222 C447 271 353 286 282 306 S140 329 112 374 C82 421 172 456 242 486 S376 502 430 520'
const REVISION_TRAIL_PATH =
  'M242 486 C375 464 472 403 426 318 C397 265 352 253 322 267'

const stages = [
  { number: '01', label: 'Curiosity', x: 86, y: 88, delay: '0.65s' },
  { number: '02', label: 'Sources', x: 282, y: 142, delay: '0.95s' },
  { number: '03', label: 'Question', x: 430, y: 222, delay: '1.4s' },
  { number: '04', label: 'Model', x: 282, y: 306, delay: '1.85s' },
  { number: '05', label: 'Evidence', x: 112, y: 374, delay: '2.15s' },
  { number: '06', label: 'Revision', x: 242, y: 486, delay: '2.55s' },
  { number: '07', label: 'Output', x: 430, y: 520, delay: '2.85s' },
]

export default function ResearchPathwayVisual() {
  const boardRef = useRef(null)
  const frameRef = useRef(null)
  const [figureRef, isVisible] = useInViewOnce({ threshold: 0.28 })
  const [introState, setIntroState] = useState(
    heroIntroHasPlayed ? 'complete' : 'idle',
  )

  useEffect(() => {
    if (!isVisible || heroIntroHasPlayed) return undefined

    const startTimer = window.setTimeout(() => {
      heroIntroHasPlayed = true
      setIntroState('running')
    }, 0)
    const completeTimer = window.setTimeout(() => {
      heroIntroHasPlayed = true
      setIntroState('complete')
    }, 3350)

    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(completeTimer)
    }
  }, [isVisible])

  const handlePointerMove = (event) => {
    if (
      event.pointerType !== 'mouse' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) return

    const board = boardRef.current
    if (!board) return

    const rect = board.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2

    if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    frameRef.current = window.requestAnimationFrame(() => {
      board.style.setProperty('--board-rx', `${(-y * 1.35).toFixed(2)}deg`)
      board.style.setProperty('--board-ry', `${(x * 1.8).toFixed(2)}deg`)
      board.style.setProperty('--board-x', `${(x * 3).toFixed(2)}px`)
      board.style.setProperty('--board-y', `${(y * 2).toFixed(2)}px`)
    })
  }

  const handlePointerLeave = () => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    const board = boardRef.current
    if (!board) return
    board.style.setProperty('--board-rx', '0deg')
    board.style.setProperty('--board-ry', '0deg')
    board.style.setProperty('--board-x', '0px')
    board.style.setProperty('--board-y', '0px')
  }

  return (
    <figure className={`research-board intro-${introState}`} ref={figureRef}>
      <div
        className="research-board-stage"
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="board-contact-shadow" aria-hidden="true" />
        <div className="board-back-sheet" aria-hidden="true">
          <span className="board-clip" />
          <span className="board-register">RSL / 24–07</span>
          <span className="board-coordinate">x: 04.7 · y: 12.1</span>
          <svg viewBox="0 0 400 460">
            <path d="M34 86h332M34 150h332M34 214h332M34 278h332M34 342h332M96 44v370M190 44v370M284 44v370" />
            <circle cx="250" cy="202" r="98" />
            <path d="M88 356c72-56 132-20 220-94" />
          </svg>
        </div>

        <div className="board-evidence-sheet" aria-hidden="true">
          <span className="evidence-kicker">EVIDENCE / TRACE 03</span>
          <svg viewBox="0 0 300 190">
            <path className="evidence-axis" d="M24 154V28M24 154h248" />
            <path className="evidence-trace" d="M28 132c18-9 25-54 43-39s26 48 43 17 29-67 49-43 20 53 41 25 30-37 64-17" />
            <circle cx="163" cy="67" r="4" />
            <path className="evidence-mark" d="M163 56V38m-5 5 5-5 5 5" />
          </svg>
          <span className="evidence-caption">signal changes where assumption fails</span>
        </div>

        <div className="research-map">
          <span className="map-tape" aria-hidden="true" />
          <svg
            viewBox="0 0 540 620"
            role="img"
            aria-labelledby="research-map-title research-map-description"
          >
            <title id="research-map-title">A layered student research pathway</title>
            <desc id="research-map-description">
              A research-board composition showing a notebook trail from
              curiosity through sources, a question, a model, evidence,
              revision, and a final output.
            </desc>

            <rect className="map-paper" x="24" y="20" width="492" height="574" />
            <path className="map-binding" d="M58 20v574" />
            <path className="map-margin" d="M78 46v520" />
            <path className="map-rule" d="M95 72h380M95 566h380" />

            <path
              className="map-trail"
              d={MAIN_TRAIL_PATH}
            />
            <path
              className="map-revision-loop"
              d={REVISION_TRAIL_PATH}
            />
            <path className="map-loop-arrow" d="M322 267l13-1-7 11" />
            <path
              className="map-trail-tracer"
              d={MAIN_TRAIL_PATH}
              aria-hidden="true"
            />
            <path
              className="map-revision-tracer"
              d={REVISION_TRAIL_PATH}
              aria-hidden="true"
            />
            <path
              className="map-loop-tracer"
              d="M322 267l13-1-7 11"
              aria-hidden="true"
            />

            {stages.map((stage) => (
              <g
                className={`map-node map-node-${stage.number}`}
                style={{ '--node-delay': stage.delay }}
                transform={`translate(${stage.x} ${stage.y})`}
                key={stage.number}
              >
                <circle className="map-node-shadow" cy="2" r="23" />
                <circle className="map-node-ring" r="22" />
                <circle className="map-node-dot" r="5" />
                <text className="map-node-number" x="-31" y="-29">{stage.number}</text>
                <text className="map-node-label" x="0" y="42" textAnchor="middle">{stage.label}</text>
              </g>
            ))}

            <g className="map-detail map-detail-sources" aria-hidden="true">
              <rect x="205" y="80" width="48" height="32" />
              <path d="M214 90h29M214 98h22M214 106h15" />
              <rect x="219" y="72" width="48" height="32" />
              <path d="M228 82h29M228 90h22M228 98h15" />
            </g>

            <g className="map-detail map-detail-equation" aria-hidden="true">
              <text x="447" y="154">x<tspan dy="3" fontSize="9">i</tspan><tspan dy="-3"> → ?</tspan></text>
              <path d="M439 166c16 7 32 5 47-3" />
            </g>

            <g className="map-detail map-detail-chart" aria-hidden="true">
              <path d="M86 291v42h58" />
              <path className="map-chart-line" d="M91 321l12-12 11 5 12-20 13 8" />
              <circle cx="126" cy="294" r="3" />
            </g>

            <g className="map-detail map-detail-note" aria-hidden="true">
              <path d="M330 425h66v47h-66zM340 439h44M340 449h35M340 459h24" />
              <path className="map-note-pin" d="M360 417l8 12" />
            </g>

            <text className="map-annotation" x="97" y="53">FIELD NOTE / 01</text>
            <text className="map-annotation map-annotation-revise" x="376" y="389">return with better evidence</text>
            <path className="map-annotation-line" d="M372 396l-39 26" />
          </svg>
        </div>

        <aside className="board-sticky-note" aria-hidden="true">
          <span>QUESTION / 05</span>
          What would change my mind?
        </aside>
        <span className="board-equation-chip" aria-hidden="true">Δx / Δt → pattern?</span>
        <span className="board-index-tab" aria-hidden="true">PATH / 01</span>
        <span className="board-status-dot" aria-hidden="true" />
      </div>
      <figcaption>
        A useful pathway is a map, not a rule. Evidence can send you back to an
        earlier question.
      </figcaption>
    </figure>
  )
}

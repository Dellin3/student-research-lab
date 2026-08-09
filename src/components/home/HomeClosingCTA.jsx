import { Link } from 'react-router-dom'
import useInViewOnce from './useInViewOnce.js'

export default function HomeClosingCTA() {
  const [sectionRef, isVisible] = useInViewOnce({ threshold: 0.2 })

  return (
    <section
      className={`home-closing-cta reveal-ready${isVisible ? ' is-revealed' : ''}`}
      aria-labelledby="home-closing-title"
      ref={sectionRef}
    >
      <svg className="closing-background-path" viewBox="0 0 1400 500" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-80 360 C190 95 420 448 685 220 S1120 40 1480 304" />
        <path d="M294 174c117-93 204-37 290 21" />
      </svg>
      <span className="closing-coordinate closing-coordinate-left" aria-hidden="true">01 → ?</span>
      <span className="closing-coordinate closing-coordinate-right" aria-hidden="true">OUTPUT / READY</span>
      <div className="closing-content">
        <p className="eyebrow">Your next move</p>
        <h2 id="home-closing-title">Do not wait for the perfect research idea.</h2>
        <p>
          Record one interest, find three credible sources, write down the
          confusion that survives reading, and choose the smallest next action.
        </p>
        <div className="home-closing-actions">
          <Link className="button light" to="/start-here">Start Here</Link>
          <Link className="button ghost-light" to="/worksheet">Open the Worksheet</Link>
        </div>
      </div>
    </section>
  )
}

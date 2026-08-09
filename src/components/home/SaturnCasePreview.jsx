import { Link } from 'react-router-dom'
import useInViewOnce from './useInViewOnce.js'

export default function SaturnCasePreview() {
  const [sectionRef, isVisible] = useInViewOnce({ threshold: 0.18 })

  return (
    <section
      className={`home-section saturn-case-preview${isVisible ? ' is-visible' : ''}`}
      aria-labelledby="saturn-preview-title"
      ref={sectionRef}
    >
      <div className="saturn-case-copy">
        <p className="eyebrow">Real case study</p>
        <h2 id="saturn-preview-title">
          From “Saturn’s rings are interesting” to an inspectable mathematical problem.
        </h2>
        <p>
          See how a broad interest can become a chain of concrete steps: learn
          the Cassini context, inspect public data, understand optical depth,
          build small models, identify mathematical structure, test methods,
          and revise with feedback.
        </p>
        <div className="saturn-case-actions">
          <Link className="button primary" to="/case-studies">
            Read the case study <span aria-hidden="true">→</span>
          </Link>
          <a
            className="home-tertiary-link"
            href="https://primes-ring-website-p9yv.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore the Saturn Rings Lab <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <figure
        className="saturn-scientific-board"
        role="img"
        aria-label="A layered scientific board showing a Cassini signal becoming a ring profile, an optical-depth question, and a mathematical diagnostic."
      >
        <div className="saturn-orbit-board" aria-hidden="true">
          <span>CONSTRUCTION GRID / RING PLANE</span>
          <svg viewBox="0 0 600 430">
            <path d="M42 84h516M42 164h516M42 244h516M42 324h516M120 42v346M240 42v346M360 42v346M480 42v346" />
            <ellipse cx="300" cy="215" rx="218" ry="88" />
            <ellipse cx="300" cy="215" rx="158" ry="62" />
            <circle cx="300" cy="215" r="28" />
            <path d="M300 48v334M74 215h452" />
          </svg>
        </div>

        <div className="saturn-signal-sheet" aria-hidden="true">
          <span className="science-sheet-label">CASSINI SIGNAL → RING PROFILE</span>
          <svg viewBox="0 0 520 260">
            <path className="science-axis" d="M34 216V40M34 216h450" />
            <path className="science-signal" d="M40 152c22-7 27-70 48-39s29 75 51 19 31-96 58-34 34 79 57 10 31-59 52-2 30 60 49 4 27-83 54-39 32 75 68 25" />
            <path className="science-profile" d="M40 188l18-22 17 12 15-49 18 31 21-76 17 87 21-44 19 22 18-62 22 80 18-40 21 28 19-91 17 106 21-57 22 31 20-77 19 95 22-48 18 24 24-61 21 74" />
            <path className="science-guide" d="M197 46v171M358 46v171" />
          </svg>
          <span className="science-sheet-note">public data / normalized trace / inspect discontinuity</span>
        </div>

        <div className="saturn-diagnostic-card" aria-hidden="true">
          <span className="diagnostic-kicker">MATHEMATICAL QUESTION / 04</span>
          <strong>τ(r) ?</strong>
          <svg viewBox="0 0 230 130">
            <path className="diagnostic-axis" d="M20 108h190M30 18v90" />
            <path className="diagnostic-branch" d="M34 90c42-2 57-52 87-52s38 48 80 53M34 64c35 0 52-33 86-33s48 33 81 33" />
            <circle cx="121" cy="38" r="4" />
          </svg>
          <span>branch / diagnostic idea</span>
        </div>

        <div className="saturn-ring-motif" aria-hidden="true">
          <svg viewBox="0 0 220 150">
            <ellipse cx="110" cy="75" rx="100" ry="31" />
            <ellipse cx="110" cy="75" rx="72" ry="21" />
            <circle cx="110" cy="75" r="23" />
          </svg>
        </div>
        <span className="saturn-board-tab" aria-hidden="true">CASE / 01</span>
        <figcaption>
          A project becomes research when each step leaves something another
          person can inspect.
        </figcaption>
      </figure>
    </section>
  )
}

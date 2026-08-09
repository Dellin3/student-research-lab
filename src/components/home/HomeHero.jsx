import { Link } from 'react-router-dom'
import ResearchPathwayVisual from './ResearchPathwayVisual.jsx'

export default function HomeHero() {
  return (
    <section className="home-product-hero" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <p className="eyebrow">Free research pathway for high school students</p>
        <h1 id="home-title">How to Start a Research Project in High School</h1>
        <p className="home-hero-lead">
          Research rarely begins with a perfect idea. Start with a curiosity,
          learn the vocabulary, find a contradiction, turn it into a testable
          question, and build the smallest project that can teach you something.
        </p>
        <div className="home-hero-actions">
          <Link className="button primary" to="/worksheet">
            Build a Research Question
          </Link>
          <Link className="button secondary" to="/start-here">
            Follow the Full Pathway
          </Link>
        </div>
        <Link className="home-tertiary-link" to="/case-studies">
          See a real research case <span aria-hidden="true">→</span>
        </Link>
        <p className="home-utility-line">
          Free <span>·</span> No account required <span>·</span> Built for
          independent student research
        </p>
      </div>
      <div className="home-hero-visual">
        <ResearchPathwayVisual />
      </div>
    </section>
  )
}

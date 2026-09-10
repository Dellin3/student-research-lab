import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../Seo.jsx'
import { getRoute } from '../../config/routes.js'
import { STARTER_EXAMPLES } from '../../data/researchSteps.js'
import './home.css'

export default function HomePage() {
  const route = getRoute('/')
  const [exampleIndex, setExampleIndex] = useState(0)
  const example = STARTER_EXAMPLES[exampleIndex]
  return <>
    <Seo title={route.title} description={route.description} pathname={route.path} />
    <main id="main-content" className="research-home">
      <section className="home-opening" aria-labelledby="home-title">
        <div className="home-opening-inner">
          <div className="home-heading">
            <div><p className="eyebrow">A starting point for student research</p><h1 id="home-title">Start with curiosity.<br /><em>Find your next step.</em></h1></div>
            <p className="home-introduction">New to research? Looking for a mentor or a project?<br />You’re in the right place.</p>
          </div>
          <div className="home-paths">
            <Link className="home-path path-start" to="/start-here">
              <div className="path-top"><span className="path-kicker">01 / Start something</span><span className="path-arrow" aria-hidden="true">↗</span></div>
              <h2>I’m new to research.</h2>
              <p>Turn an interest into a small question—and a first attempt. No experience needed.</p>
              <span className="path-action">Show me how to begin <span aria-hidden="true">→</span></span>
            </Link>
            <Link className="home-path path-find" to="/resources">
              <div className="path-top"><span className="path-kicker">02 / Find support</span><span className="path-arrow" aria-hidden="true">↗</span></div>
              <h2>I’m looking for an opportunity.</h2>
              <p>Find research programs, explore potential mentors, and learn who to ask.</p>
              <span className="path-action">Find mentors & programs <span aria-hidden="true">→</span></span>
            </Link>
          </div>
          <div className="home-quick"><span>Free to explore. No account needed.</span><Link to="/resources?view=sources">Just looking for papers or data? <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
      <section className="home-example" aria-labelledby="small-start-title">
        <div className="example-heading"><div><p className="eyebrow">See what a beginning can look like</p><h2 id="small-start-title">Big curiosity.<br /><em>Small first steps.</em></h2><p>You don’t need a breakthrough to begin.<br />You need a question you can explore.</p></div>
          <div className="field-switch" role="group" aria-label="Choose a worked example">{STARTER_EXAMPLES.map((item, i) => <button key={item.id} type="button" aria-pressed={i === exampleIndex} onClick={() => setExampleIndex(i)}>{item.label}</button>)}</div>
        </div>
        <div className="home-example-body" aria-live="polite" aria-atomic="true" key={example.id}>
          <p className="worked-label">Worked example <span> / {example.label}</span></p>
          <div className="example-interest"><span>AN INTEREST</span><p>{example.interest}</p><span className="down-arrow" aria-hidden="true">↓</span></div>
          <div className="example-focused"><span>A QUESTION TO EXPLORE</span><h3>{example.question}</h3></div>
          <Link className="inline-action" to={`/start-here?example=${example.id}`}>See the first steps <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  </>
}

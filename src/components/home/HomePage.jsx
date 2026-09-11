import { Link } from 'react-router-dom'
import RouteSeo from '../layout/RouteSeo.jsx'
import './home.css'

export default function HomePage() {
  return <><RouteSeo path="/" /><main id="main-content" className="research-home">
    <section className="home-opening" aria-labelledby="home-title"><div className="home-opening-inner">
      <div className="home-heading"><div><p className="eyebrow">A starting point for student research</p><h1 id="home-title">Start with curiosity.<br /><em>Find your next step.</em></h1></div><p className="home-introduction">Start a project of your own.<br />Or find a program to join.</p></div>
      <div className="home-paths">
        <Link className="home-path path-start" to="/start-here"><div className="path-top"><span className="path-kicker">01 / Begin independently</span><span className="path-arrow" aria-hidden="true">↗</span></div><h2>How do I start?</h2><p>Four steps to turn an interest into a small research project. No experience needed.</p><span className="path-action">Start on your own <span aria-hidden="true">→</span></span></Link>
        <Link className="home-path path-find" to="/resources"><div className="path-top"><span className="path-kicker">02 / Find an opportunity</span><span className="path-arrow" aria-hidden="true">↗</span></div><h2>Which program fits me?</h2><p>Explore research programs, check who can apply, and go straight to the official website.</p><span className="path-action">Find a program <span aria-hidden="true">→</span></span></Link>
      </div>
      <div className="home-quick"><span>Just need a resource?</span><div className="quick-resource-links"><a href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer">Google Scholar ↗</a><a href="https://catalog.data.gov/" target="_blank" rel="noopener noreferrer">Data.gov ↗</a><a href="https://www.zotero.org/support/quick_start_guide" target="_blank" rel="noopener noreferrer">Zotero ↗</a></div></div>
    </div></section>
  </main></>
}

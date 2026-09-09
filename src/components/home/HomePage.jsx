import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../Seo.jsx'
import { getRoute } from '../../config/routes.js'
import { CORE_PATHS } from '../../data/corePaths.js'
import './home.css'

export default function HomePage() {
  const route = getRoute('/')
  const [selected, setSelected] = useState(0)
  const active = CORE_PATHS[selected]
  return (
    <>
      <Seo title={route.title} description={route.description} pathname={route.path} />
      <main id="main-content" className="core-home">
        <section className="research-entry" aria-labelledby="home-title">
          <div className="entry-copy">
            <p className="eyebrow">For student researchers</p>
            <h1 id="home-title">A good question.<br /><em>A place to start.</em></h1>
            <p className="entry-lead">Find your direction, shape a question, and make your first investigation count.</p>
            <fieldset className="entry-choices">
              <legend>Where are you now?</legend>
              {CORE_PATHS.map((item, index) => (
                <label className={selected === index ? 'entry-choice is-selected' : 'entry-choice'} key={item.id}>
                  <input type="radio" name="starting-point" checked={selected === index} onChange={() => setSelected(index)} />
                  <span className="choice-index" aria-hidden="true">0{index + 1}</span>
                  <span>{item.label}</span>
                  <span className="choice-marker" aria-hidden="true">{selected === index ? '↗' : '+'}</span>
                </label>
              ))}
            </fieldset>
            <Link className="button primary entry-action" to={active.path}>{active.action} <span aria-hidden="true">↗</span></Link>
            <Link className="entry-record" to="/worksheet">Continue my research record</Link>
          </div>
          <div className="example-space">
            <div className="example-overline"><span>One idea, taking shape</span><span>0{selected + 1} / 03</span></div>
            <div className="example-depth" data-stage={active.id}>
              <article className="example-surface" key={active.id} aria-live="polite" aria-atomic="true">
                <p className="example-label">WORKED EXAMPLE · Urban ecology</p>
                <h2>{active.title}</h2>
                <p className="example-question">{active.example}</p>
                <dl>{active.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
                <p className="example-note">{active.note}</p>
              </article>
            </div>
            <Link className="example-more" to="/case-studies">Explore examples in other fields <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
        <section className="entry-resources" aria-labelledby="resources-heading">
          <div><p className="eyebrow">Keep moving</p><h2 id="resources-heading">Find what you need.</h2></div>
          <div className="entry-resource-links">
            <Link to="/ai-literature"><strong>Find & read papers</strong><span>Search, check, and keep useful sources.</span><i aria-hidden="true">↗</i></Link>
            <Link to="/outreach"><strong>Ask a mentor</strong><span>Prepare a specific question and useful context.</span><i aria-hidden="true">↗</i></Link>
            <Link to="/resources"><strong>Browse resources</strong><span>Research tools, datasets, and opportunities.</span><i aria-hidden="true">↗</i></Link>
          </div>
        </section>
      </main>
    </>
  )
}

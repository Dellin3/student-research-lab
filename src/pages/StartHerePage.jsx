import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { STARTER_EXAMPLES } from '../data/researchSteps.js'

function WorkedExample() {
  const [params, setParams] = useSearchParams()
  const example = STARTER_EXAMPLES.find(item => item.id === params.get('example')) || STARTER_EXAMPLES[0]
  // A shared example link opens at the example; switching subjects never moves the page.
  const openedFromLink = useRef(params.has('example') || params.has('step'))
  useEffect(() => {
    if (openedFromLink.current) document.getElementById('example')?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [])
  function choose(id) {
    const next = new URLSearchParams(params)
    next.delete('step')
    if (id === STARTER_EXAMPLES[0].id) next.delete('example')
    else next.set('example', id)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return <section className="starter-example" id="example" aria-labelledby="example-title">
    <div className="starter-example-intro">
      <p className="eyebrow">Worked example</p>
      <h2 id="example-title">{example.heading}</h2>
      <p className="example-interest-line"><span>Starting interest</span>{example.interest}</p>
      <fieldset className="example-switch">
        <legend>Follow the four steps in another subject</legend>
        {STARTER_EXAMPLES.map(item => <label key={item.id} className={item.id === example.id ? 'is-selected' : undefined}><input type="radio" name="starter-example" value={item.id} checked={item.id === example.id} onChange={() => choose(item.id)} />{item.label}</label>)}
      </fieldset>
      <p className="example-honesty">Constructed teaching material: a plan to learn from, not real data or a new finding.</p>
    </div>
    <ol className="example-walk">
      {example.steps.map(([title, text, keepLabel, keepValue], index) => <li key={title}>
        <span className="example-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div><h3>{title}</h3><p>{text}</p><p className="example-keep"><span>{keepLabel}</span>{keepValue}</p></div>
      </li>)}
    </ol>
  </section>
}

export default function StartHerePage() {
  return <><RouteSeo path="/start-here" /><main id="main-content" className="simple-start">
    <header className="hub-heading"><p className="eyebrow">01 / Start on your own</p><h1>One question.<br /><em>One small beginning.</em></h1><p>Research starts with a focused question and evidence you can check.</p></header>
    <ol className="starter-steps">
      <li><span className="starter-number" aria-hidden="true">01</span><div><h2>Make your question small.</h2><p>Choose something you want to understand. Limit it to one place, text, pattern, dataset, or comparison that you can actually explore.</p></div></li>
      <li><span className="starter-number" aria-hidden="true">02</span><div><h2>Read a few useful sources.</h2><p>Start with an overview, then follow a reference to an original paper. Note what was asked, how it was studied, and what remains unclear. Check any claim from artificial intelligence against the original source.</p><a className="resource-direct" href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer">Find papers on Google Scholar ↗</a></div></li>
      <li><span className="starter-number" aria-hidden="true">03</span><div><h2>Try one thing.</h2><p>Make a small calculation, compare two texts, inspect a public dataset, or plan a safe observation. Record the method and result, including what did not work. Ask a teacher about any permissions or safety concerns first.</p><a className="resource-direct" href="https://catalog.data.gov/" target="_blank" rel="noopener noreferrer">Find public datasets on Data.gov ↗</a></div></li>
      <li><span className="starter-number" aria-hidden="true">04</span><div><h2>Write down what changed.</h2><p>In your own notebook or document, keep the question, sources, method, result, one limitation, and one next step. Share a short summary with a teacher and ask one specific question.</p><a className="resource-direct" href="https://www.zotero.org/support/quick_start_guide" target="_blank" rel="noopener noreferrer">Organize references with Zotero ↗</a></div></li>
    </ol>
    <WorkedExample />
    <section className="starter-guides" aria-labelledby="starter-guides-title"><h2 id="starter-guides-title">A little more guidance.</h2><div className="starter-guide-links"><Link to="/guides/research-without-a-mentor">How to start research without a mentor →</Link><Link to="/guides/read-your-first-paper">How to read your first research paper →</Link><Link to="/resources#sources">More free papers, data, and research projects →</Link></div></section>
    <div className="starter-next"><Link className="resource-direct" to="/my-research">Keep my research progress →</Link><Link className="button primary" to="/resources">Find a program ↗</Link></div>
  </main></>
}

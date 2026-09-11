import { Link } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'

export default function StartHerePage() {
  return <><RouteSeo path="/start-here" /><main id="main-content" className="simple-start">
    <header className="hub-heading"><p className="eyebrow">01 / Start on your own</p><h1>One question.<br /><em>One small beginning.</em></h1><p>Research starts with a focused question and evidence you can check.</p></header>
    <ol className="starter-steps">
      <li><span className="starter-number" aria-hidden="true">01</span><div><h2>Make your question small.</h2><p>Choose something you want to understand. Limit it to one place, text, pattern, dataset, or comparison that you can actually explore.</p></div></li>
      <li><span className="starter-number" aria-hidden="true">02</span><div><h2>Read a few useful sources.</h2><p>Start with an overview, then follow a reference to an original paper. Note what was asked, how it was studied, and what remains unclear. Check any claim from artificial intelligence against the original source.</p><a className="resource-direct" href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer">Find papers on Google Scholar ↗</a></div></li>
      <li><span className="starter-number" aria-hidden="true">03</span><div><h2>Try one thing.</h2><p>Make a small calculation, compare two texts, inspect a public dataset, or plan a safe observation. Record the method and result, including what did not work. Ask a teacher about any permissions or safety concerns first.</p><a className="resource-direct" href="https://catalog.data.gov/" target="_blank" rel="noopener noreferrer">Find public datasets on Data.gov ↗</a></div></li>
      <li><span className="starter-number" aria-hidden="true">04</span><div><h2>Write down what changed.</h2><p>In your own notebook or document, keep the question, sources, method, result, one limitation, and one next step. Share a short summary with a teacher and ask one specific question.</p><a className="resource-direct" href="https://www.zotero.org/support/quick_start_guide" target="_blank" rel="noopener noreferrer">Organize references with Zotero ↗</a></div></li>
    </ol>
    <section className="starter-example" id="example" aria-labelledby="example-title"><div><p className="eyebrow">Worked example</p><h2 id="example-title">From city heat<br />to one courtyard.</h2></div><dl><div><dt>Question</dt><dd>Are shaded surfaces cooler than sunny surfaces in the same courtyard?</dd></div><div><dt>First attempt</dt><dd>With permission, compare the same surface material in shade and sun at similar times. Record the weather and repeat the observations.</dd></div><div><dt>What to keep</dt><dd>Your measurements, method, and other explanations—such as weather or material differences. Decide what you would check next.</dd></div></dl></section>
    <div className="starter-next"><p>Prefer to work within a research program?</p><Link className="button primary" to="/resources">Find a program ↗</Link></div>
  </main></>
}

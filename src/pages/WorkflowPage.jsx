import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
export default function WorkflowPage() {
  return <><RouteSeo path="/research-workflow" /><PageIntro eyebrow="Evidence & revision" title={<>Let the result <em>change the question.</em></>} description="Compare what you expected with what happened. Then choose one thing to revise." />
    <main id="main-content" className="page-content guide-reading">
      <div className="guide-layout"><ol className="checklist">
        <li><span>01</span><div><h3>The model failed</h3><p>Check units and a known case. Simplify the model, then identify which assumption the failure challenges.</p></div></li>
        <li><span>02</span><div><h3>The data do not fit</h3><p>Inspect collection methods, definitions, missing values, and scale. Decide whether the data can answer your question at all.</p></div></li>
        <li><span>03</span><div><h3>The question does not distinguish answers</h3><p>Name evidence that would change your conclusion. If there is none, revise the wording or choose a different comparison.</p></div></li>
      </ol>
      <section className="guide-example"><p className="eyebrow">A useful research habit</p><h2>Keep the reason for the change.</h2><p>Record the date, the old expectation, the evidence, and your revision. Change one element at a time, then plan the smallest next test.</p></section></div>
      <Link className="button primary" to="/worksheet">Record the revision ↗</Link>
    </main></>
}

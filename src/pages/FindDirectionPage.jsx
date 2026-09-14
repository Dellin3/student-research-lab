import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
export default function FindDirectionPage() {
  return <><RouteSeo path="/find-a-direction" /><PageIntro eyebrow="Choose a direction" title={<>Make the interest <em>specific.</em></>} description="Name what you will study, how you will look at it, and where the first attempt stops." />
    <main id="main-content" className="page-content guide-reading">
      <div className="guide-layout"><ol className="checklist">
        <li><span>01</span><div><h3>Name an object</h3><p>Replace “mathematics” with a graph family, “climate” with a temperature record, or “education” with one learning behavior.</p></div></li>
        <li><span>02</span><div><h3>Choose a lens</h3><p>Look for a relationship, a comparison, a pattern, a proof, or a failure case. Reading a few sources will help you choose a useful lens.</p></div></li>
        <li><span>03</span><div><h3>Set one boundary</h3><p>Use one dataset, city, time window, theorem family, or experimental setting. Ask whether you can access what you would inspect first.</p></div></li>
      </ol>
      <section className="guide-example"><p className="example-label">WORKED EXAMPLE</p><h2>“Climate change” becomes a place to look.</h2><p>Study the relationship between tree cover and summer surface temperature in one city. The object, lens, and boundary are clear; the question comes next.</p></section></div>
      <Link className="button primary" to="/topic-narrowing">Narrow my direction ↗</Link>
      <p className="hub-footnote"><Link to="/case-studies">See examples in other fields.</Link></p>
    </main></>
}

import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
const STEPS = [
  ['Choose the smallest useful attempt', 'Use one dataset slice, a small mathematical case, one comparison, or one model parameter. Decide what result you will keep.'],
  ['Name what could challenge your idea', 'Compare with a baseline, check a known case, look for a counterexample, or vary an assumption. Choose a check that fits your method.'],
  ['Check access and assumptions', 'Read the documentation. Check units, missing observations, data provenance, equipment, and any permissions the work requires.'],
  ['Record the limit', 'State what the result cannot show. Keep the method, inputs, and settings so someone else can inspect the attempt.'],
]
export default function BuildProjectPage() {
  return <><RouteSeo path="/build-a-project" /><PageIntro eyebrow="Design an investigation" title="Start small enough to learn." description="Choose a first attempt that can expose a weak assumption, a missing measurement, or a useful result." />
    <main id="main-content" className="page-content guide-reading"><ol className="checklist">{STEPS.map(([title,text],i)=><li key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
      <section className="guide-example"><p className="eyebrow">Match the check to the work</p><p>A proof may need a boundary case. A computation needs a baseline. An experiment may need a control. An observational study needs to consider confounding factors.</p></section>
      <Link className="button primary" to="/investigation-planner">Plan my first test ↗</Link>
    </main></>
}

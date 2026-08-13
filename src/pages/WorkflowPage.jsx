import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

export default function WorkflowPage() {
  const cycle = ['Question', 'Source', 'Model', 'Test', 'Failure', 'Revision', 'New Question']
  return (
    <>
      <RouteSeo path="/research-workflow" />
      <PageIntro eyebrow="How research moves" title="Research is iterative" description="Each source, test, and failure can change the question. That change is progress when you can explain why it happened." />
      <main id="main-content" className="page-content">
        <section className="cycle-section">
          <div className="cycle-copy"><p className="eyebrow">The working loop</p><h2>Return with better information</h2><p>A loop is not repetition if each pass sharpens an assumption, method, measurement, or question.</p></div>
          <ol className="cycle">{cycle.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol>
        </section>
        <section>
          <SectionHeading eyebrow="When something fails" title="Treat failure as a diagnostic" />
          <div className="three-column">
            <article><h3>Model failure</h3><p>Ask which assumption is doing too much work. Remove complexity, check units, and test a known case.</p></article>
            <article><h3>Data failure</h3><p>Inspect collection methods, missing values, definitions, and scale. The data may answer a nearby question better.</p></article>
            <article><h3>Question failure</h3><p>If evidence cannot distinguish possible answers, revise the question so a result could change your conclusion.</p></article>
          </div>
        </section>
        <section className="split-section">
          <div><p className="eyebrow">Save</p><h2>Record decisions, not only results</h2></div>
          <div className="prose"><p>For each substantial change, record the date, expectation, outcome, and next revision.</p><ul><li>What prompted the change</li><li>Which assumption, method, or question changed</li><li>What would challenge the new direction</li><li>The smallest next test</li></ul></div>
        </section>
        <aside className="callout">
          <div><p className="eyebrow">Continue</p><h2>Version your thinking.</h2></div>
          <p>Keep question v1, v2, and v3. Their differences show how evidence improved the project. You can also <Link to="/research-question-builder">build a draft question</Link>.</p>
          <Link className="button primary" to="/worksheet">Update Research Record</Link>
        </aside>
      </main>
    </>
  )
}

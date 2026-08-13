import { Link } from 'react-router-dom'
import ArrowSequence from '../components/layout/ArrowSequence.jsx'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

const EXAMPLES = [
  ['Mathematics', 'Patterns → discrete mathematics → graph structure → network connectivity → Which local rules make a network resilient to node removal?'],
  ['Physics', 'Motion → fluid dynamics → vortices → wake formation → How does obstacle shape affect vortex shedding in a simple flow?'],
  ['Computer science', 'Machine learning → model evaluation → distribution shift → image classification → Which augmentations improve robustness when lighting changes?'],
  ['Biology', 'Ecology → plant interactions → pollination → urban gardens → How does plant diversity relate to pollinator visit frequency?'],
  ['Social science', 'Education → learning behavior → study strategies → retrieval practice → How does spaced self-testing affect retention over two weeks?'],
  ['Environmental science', 'Climate → cities → heat islands → tree cover → How strongly is neighborhood canopy associated with afternoon surface temperature?'],
]

export default function FindDirectionPage() {
  return (
    <>
      <RouteSeo path="/find-a-direction" />
      <PageIntro eyebrow="Stage one" title="Find a direction" description="Good research topics are narrowed through reading, comparison, and contact with concrete phenomena—not found fully formed." />
      <main id="main-content" className="page-content">
        <section>
          <SectionHeading eyebrow="The narrowing ladder" title="Move from a noun to a question" description="At each step, replace a broad label with something more observable and bounded." />
          <ArrowSequence items={['Interest', 'Broad Field', 'Subfield', 'Concrete Phenomenon', 'Researchable Problem']} />
        </section>
        <section className="split-section">
          <div><p className="eyebrow">Test the direction</p><h2>A useful problem has boundaries</h2></div>
          <div className="question-list"><p>Can I name the system, population, object, or process?</p><p>Can I identify a variable, relationship, pattern, or mechanism?</p><p>Can I access evidence?</p><p>Can I build a smaller version?</p><p>Can I explain what result would surprise me?</p></div>
        </section>
        <section>
          <SectionHeading eyebrow="Across disciplines" title="Examples of progressive narrowing" description="A first question guides your next search; it does not need to remain permanent." />
          <div className="example-grid">{EXAMPLES.map(([field, path]) => <article className="example-card" key={field}><p>{field}</p><h3>{path}</h3></article>)}</div>
        </section>
        <section className="two-column-cards">
          <article><p className="eyebrow">Too broad</p><h2>“I want to study climate change.”</h2><p>This names an area but not a system, scale, variable, mechanism, or evidence source.</p></article>
          <article className="accent-card"><p className="eyebrow">Researchable direction</p><h2>“How does tree cover relate to summer surface temperature across neighborhoods in my city?”</h2><p>This suggests variables, public data, scale, and limitations. Next, <Link to="/research-question-builder">shape a testable question</Link>.</p></article>
        </section>
      </main>
    </>
  )
}

import { Link } from 'react-router-dom'
import ArrowSequence from '../components/layout/ArrowSequence.jsx'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

const PATHWAY = [
  'Interest', 'Focused Field', 'Sources', 'Expert Thinking', 'Questions',
  'Toy Model', 'Data', 'Mentor Feedback', 'Revision', 'Output',
]

const CHECKLIST = [
  ['Choose one area', 'Write down a subject you return to voluntarily—not the subject you think sounds most impressive.'],
  ['Collect five search terms', 'Include a broad field, a phenomenon, a method, a dataset, and one unfamiliar technical term.'],
  ['Find three credible sources', 'Choose one overview, one original study, and one recent paper that cites earlier work.'],
  ['Keep a confusion list', 'Record terms, graphs, assumptions, and conclusions you cannot yet explain.'],
  ['Write three questions', 'Make each question narrow enough to suggest evidence that could change your mind.'],
  ['Choose one next action', 'Read one section, reproduce one figure, inspect one dataset, or draft one small model.'],
]

export default function StartHerePage() {
  return (
    <>
      <RouteSeo path="/start-here" />
      <PageIntro eyebrow="Orientation" title="Start here" description="A research project is a chain of increasingly precise decisions. You do not need a perfect topic on day one; you need a way to notice, test, and record what you learn." />
      <main id="main-content" className="page-content">
        <section>
          <SectionHeading eyebrow="The whole journey" title="From interest to an inspectable result" description="Each stage should leave evidence of your thinking so you can explain changes and recover when an approach fails." />
          <ArrowSequence items={PATHWAY} compact />
        </section>
        <section className="split-section">
          <div><p className="eyebrow">See</p><h2>Make uncertainty specific</h2></div>
          <div className="prose"><p>Early reading often creates more questions. That is useful: vocabulary improves searches, failed models expose assumptions, and feedback reveals what another person needs to trust your work.</p><p>Keep dated notes, preserve failed attempts, and write down why you changed direction.</p></div>
        </section>
        <section>
          <SectionHeading eyebrow="Try" title="A concrete first-day checklist" />
          <ol className="checklist">
            {CHECKLIST.map(([title, text], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
          </ol>
        </section>
        <aside className="callout">
          <div><p className="eyebrow">Continue</p><h2>Make tomorrow obvious.</h2></div>
          <p>End by choosing one action that begins with a verb and fits under an hour. If you have a topic, <Link to="/research-question-builder">test your question</Link>.</p>
          <Link className="button primary" to="/worksheet">Open Research Record</Link>
        </aside>
      </main>
    </>
  )
}

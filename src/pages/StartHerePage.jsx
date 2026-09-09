import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

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
      <PageIntro eyebrow="Orientation" title="Start here" description="Choose an interest, read a little, and leave with one concrete next action." />
      <main id="main-content" className="page-content">
        <section>
          <SectionHeading eyebrow="Try" title="A concrete first-day checklist" />
          <ol className="checklist">
            {CHECKLIST.map(([title, text], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
          </ol>
        </section>
        <p className="hub-footnote"><Link to="/topic-narrowing">Find a direction</Link> · <Link to="/worksheet">Keep your notes</Link></p>
      </main>
    </>
  )
}

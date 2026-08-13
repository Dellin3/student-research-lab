import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

const GUIDES = [
  ['/find-a-direction', 'Find a direction', 'Narrow a broad interest toward a bounded phenomenon, structure, or relationship.'],
  ['/research-workflow', 'Research workflow', 'Use evidence, failure, and revision as a repeatable working cycle.'],
  ['/ai-literature', 'AI & literature', 'Search for sources, trace claims, map disagreements, and verify AI suggestions.'],
  ['/build-a-project', 'Build a project', 'Design a smallest investigation with transparent assumptions and inspectable evidence.'],
  ['/outreach', 'Outreach', 'Prepare specific, respectful requests for feedback from well-matched mentors.'],
]

export default function LearnHubPage() {
  return (
    <>
      <RouteSeo path="/learn" />
      <PageIntro eyebrow="Learning hub" title="Learn how research takes shape" description="Read the guides in order or enter where your project is stuck. Each one connects an idea to a concrete action and a record you can keep." />
      <main id="main-content" className="page-content hub-page">
        <section>
          <SectionHeading eyebrow="A calm path through uncertainty" title="Choose the guide that matches your next decision" description="Research rarely proceeds in a straight line. Return to a guide whenever new evidence changes what you need to understand." />
          <div className="hub-list">
            {GUIDES.map(([path, title, description], index) => (
              <article className="hub-item" key={path}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h2>{title}</h2><p>{description}</p></div>
                <Link className="text-link" to={path}>Read guide <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>
        <aside className="callout">
          <div><p className="eyebrow">Start</p><h2>New to research?</h2></div>
          <p>Begin with the whole pathway and a first-day checklist before choosing a guide.</p>
          <Link className="button primary" to="/start-here">Start here</Link>
        </aside>
      </main>
    </>
  )
}

import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

export default function ToolsHubPage() {
  return (
    <>
      <RouteSeo path="/tools" />
      <PageIntro eyebrow="Tools hub" title="Tools for doing the next piece of work" description="Use these tools in sequence. They support judgment and revision; they do not certify that a direction or question is novel, true, ethical, or feasible." />
      <main id="main-content" className="page-content hub-page">
        <section>
          <SectionHeading eyebrow="A working sequence" title="Narrow, question, investigate, and keep the work" description="Each tool produces a different artifact. Move forward when useful, or return when evidence changes the direction." />
          <ol className="tool-sequence">
            <li>
              <p className="eyebrow">01 · Narrow a direction</p>
              <h2>Topic Narrowing Lab</h2>
              <p>Turn a broad interest into one or more bounded research directions by naming an object, a discipline-specific lens, and one inspectable boundary.</p>
              <Link className="button primary" to="/topic-narrowing">Open Topic Narrowing Lab</Link>
            </li>
            <li>
              <p className="eyebrow">02 · Form a question</p>
              <h2>Research Question Builder</h2>
              <p>Turn a direction into a draft you can measure, compare, compute, or prove. Suggestions are deterministic and remain visible to you.</p>
              <Link className="button secondary" to="/research-question-builder">Open question builder</Link>
            </li>
            <li>
              <p className="eyebrow">03 · Plan the first investigation</p>
              <h2>Investigation Planner</h2>
              <p>Define what evidence matters, the smallest informative investigation, a comparison or challenge, and one concrete first action.</p>
              <Link className="button secondary" to="/investigation-planner">Open Investigation Planner</Link>
            </li>
            <li>
              <p className="eyebrow">04 · Keep the work</p>
              <h2>Research Record</h2>
              <p>Keep plans, sources, evidence, revisions, feedback, and communication notes locally in your browser.</p>
              <Link className="button secondary" to="/worksheet">Open Research Record</Link>
            </li>
          </ol>
        </section>
        <section className="split-section">
          <div><p className="eyebrow">Understand</p><h2>A tool should leave evidence behind</h2></div>
          <div className="prose">
            <p>Useful research tools help you compare versions, expose assumptions, or preserve decisions. Keep the output only when you can explain and revise it.</p>
            <p>If you need the concepts before using a tool, visit the <Link to="/learn">learning hub</Link> or the <Link to="/find-a-direction">Find a direction</Link> guide.</p>
          </div>
        </section>
      </main>
    </>
  )
}

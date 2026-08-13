import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

export default function ToolsHubPage() {
  return (
    <>
      <RouteSeo path="/tools" />
      <PageIntro eyebrow="Tools hub" title="Tools for doing the next piece of work" description="Use these tools to create useful research artifacts. They support judgment and revision; they do not certify that a question is novel, true, ethical, or feasible." />
      <main id="main-content" className="page-content hub-page">
        <section>
          <SectionHeading eyebrow="Build and save" title="Two places to turn thinking into work" />
          <div className="tool-hub-grid">
            <article>
              <p className="eyebrow">Shape a question</p>
              <h2>Research Question Builder</h2>
              <p>Narrow an interest, name evidence and variables, inspect scope, and produce a draft you can revise. Suggestions are deterministic and remain visible to you.</p>
              <Link className="button primary" to="/research-question-builder">Open question builder</Link>
            </article>
            <article>
              <p className="eyebrow">Keep continuity</p>
              <h2>Research Record</h2>
              <p>Save sources, decisions, open questions, attempts, limitations, feedback, and next actions locally in your browser.</p>
              <Link className="button secondary" to="/worksheet">Open Research Record</Link>
            </article>
          </div>
        </section>
        <section className="split-section">
          <div><p className="eyebrow">Understand</p><h2>A tool should leave evidence behind</h2></div>
          <div className="prose"><p>Useful research tools help you compare versions, expose assumptions, or preserve decisions. Keep the output only when you can explain and revise it.</p><p>If you need context before using a tool, visit the <Link to="/learn">learning hub</Link>.</p></div>
        </section>
      </main>
    </>
  )
}

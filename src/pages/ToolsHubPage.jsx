import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { CORE_PATHS } from '../data/corePaths.js'

export default function ToolsHubPage() {
  return <>
    <RouteSeo path="/tools" />
    <PageIntro eyebrow="Research tools" title={<>Work on <em>your next step.</em></>} description="Choose the tool that fits the question in front of you." />
    <main id="main-content" className="page-content compact-hub">
      <ol className="core-tool-list">{CORE_PATHS.map((tool,index) => <li key={tool.id}>
        <span className="tool-number">0{index + 1}</span><div><h2>{tool.action}</h2><p>{tool.description}</p></div>
        <Link className="button secondary" to={tool.path}>Open tool <span className="sr-only">: {tool.action}</span><span aria-hidden="true">↗</span></Link>
      </li>)}</ol>
      <Link className="record-entry" to="/worksheet"><div><h2>Research Record</h2><p>Keep your question, sources, evidence, and next action together.</p></div><span aria-hidden="true">↗</span></Link>
    </main>
  </>
}

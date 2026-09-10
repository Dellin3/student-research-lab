import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
const GUIDES = [
  ['/find-a-direction', 'Choose a research direction', 'Turn an interest into one object, one lens, and a boundary.'],
  ['/ai-literature', 'Find and read papers', 'Trace claims to their sources and identify the next useful question.'],
  ['/build-a-project', 'Design your first investigation', 'Choose evidence, check assumptions, and start small.'],
  ['/research-workflow', 'Make sense of a result', 'Use evidence and failed attempts to revise your question.'],
  ['/outreach', 'Get useful feedback', 'Find a relevant mentor and write a specific request.'],
]
export default function LearnHubPage() {
  return <><RouteSeo path="/learn" /><PageIntro eyebrow="Research guides" title={<>A little guidance. <em>Then try it.</em></>} description="Start with the decision you need to make." />
    <main id="main-content" className="page-content compact-hub"><div className="core-guide-list">{GUIDES.map(([path,title,description],i)=><Link to={path} key={path}><span className="tool-number">0{i+1}</span><div><h2>{title}</h2><p>{description}</p></div><span aria-hidden="true">↗</span></Link>)}</div>
      <p className="hub-footnote">New to research? <Link to="/start-here">Try the first-day checklist.</Link> <Link to="/case-studies">See a worked example.</Link></p>
    </main></>
}

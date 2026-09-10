import { Link } from 'react-router-dom'
import SourceTriage from '../components/literature/SourceTriage.jsx'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'

const METHOD = [
  ['Find a foothold', 'Start with an overview or textbook to learn the vocabulary. Use those terms to find original papers.'],
  ['Read for the question and method', 'Identify what was asked, what was measured or argued, and which assumptions matter. Inspect the figures and evidence.'],
  ['Check the claim at its source', 'Follow important claims to the original work. Record the citation, relevant passage, and limitation.'],
  ['Write down what remains unclear', 'Compare sources. Keep disagreements, unknown terms, and one next search instead of collecting links without a purpose.'],
]

export default function AiLiteraturePage() {
  return (
    <>
      <RouteSeo path="/ai-literature" />
      <PageIntro eyebrow="Literature" title={<>Read to find <em>the next question.</em></>} description="Keep the source, the evidence, and the uncertainty together." />
      <main id="main-content" className="page-content guide-reading">
        <div className="guide-layout"><ol className="checklist">{METHOD.map(([title,text],index)=><li key={title}><span>0{index+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
        <section className="guide-example"><p className="eyebrow">A reading companion</p><h2>Using artificial intelligence (AI)</h2><p>Use it to explore vocabulary, explain unfamiliar terms, or challenge your notes. Open the original source and check the relevant passage before relying on a claim or citation.</p></section></div>
        <details className="guide-exercise"><summary>Practice deciding what a source contributes</summary><SourceTriage /></details>
        <div className="button-row"><Link className="button primary" to="/resources?view=sources">Find research sources ↗</Link><Link className="text-link" to="/worksheet">Keep source notes</Link></div>
      </main>
    </>
  )
}

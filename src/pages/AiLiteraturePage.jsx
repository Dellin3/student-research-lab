import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

const METHOD = [
  ['Orient', 'Use a textbook chapter, review article, or university guide to learn the field’s vocabulary.'],
  ['Trace', 'Follow important claims to the original paper instead of relying on a summary or snippet.'],
  ['Map', 'Group sources by question, method, dataset, finding, disagreement, and citation relationship.'],
  ['Verify', 'Open every AI-suggested reference. Confirm its title, authors, venue, year, and claimed result.'],
  ['Extract', 'Note the methods experts repeatedly use and why they choose them.'],
  ['Question', 'Collect limitations, conflicting results, untested assumptions, and future-work proposals.'],
]

export default function AiLiteraturePage() {
  return (
    <>
      <RouteSeo path="/ai-literature" />
      <PageIntro eyebrow="Sources and tools" title="AI & literature" description="A literature review maps how experts define a problem, produce evidence, disagree, and identify what remains unknown." />
      <main id="main-content" className="page-content">
        <section><SectionHeading eyebrow="A reliable method" title="Search outward, verify inward" /><ol className="method-list">{METHOD.map(([title, text], index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
        <section className="two-column-cards">
          <article><p className="eyebrow">Primary sources</p><h2>Evidence from the original work</h2><p>Papers, datasets, reports, observations, interviews, experiments, and source documents present original evidence or analysis.</p></article>
          <article><p className="eyebrow">Secondary sources</p><h2>Interpretation and orientation</h2><p>Reviews, textbooks, news, and explainers provide context. Use them to navigate, then verify key claims at their source.</p></article>
        </section>
        <section className="split-section">
          <div><p className="eyebrow">Literature map</p><h2>Give every source a role</h2></div>
          <div className="prose"><p>Save the full citation when you first open a source. Record:</p><ul><li>The problem and why it matters</li><li>The data, model, experiment, or argument</li><li>The result and supporting evidence</li><li>Assumptions and limitations</li><li>How it connects to earlier and later work</li></ul></div>
        </section>
        <section>
          <SectionHeading eyebrow="AI verification protocol" title="Never cite what you have not opened" />
          <div className="warning-panel">
            <div><h3>Use AI for</h3><ul><li>Search vocabulary</li><li>Explaining unfamiliar terms</li><li>Comparing your own notes</li><li>Generating counterarguments</li></ul></div>
            <div><h3>Do not use AI as</h3><ul><li>A bibliographic database</li><li>Proof a claim is true</li><li>A substitute for methods</li><li>An author you imitate</li></ul></div>
            <div><h3>Before saving a claim</h3><ul><li>Open the publication</li><li>Locate the relevant passage</li><li>Check context and limits</li><li>Save the real citation</li></ul></div>
          </div>
        </section>
      </main>
    </>
  )
}

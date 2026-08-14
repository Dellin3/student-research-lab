import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

const BLOCKS = [
  ['Research question', 'Name the system or mechanism, define scope, and state what evidence could change your answer.'],
  ['Assumptions', 'List what you treat as fixed, negligible, measurable, or representative.'],
  ['Toy model', 'Preserve one central mechanism in the smallest system you can calculate, simulate, observe, or test.'],
  ['Public data', 'Read documentation, inspect units and provenance, visualize raw values, and check missing observations.'],
  ['Basic analysis', 'Begin with distributions, examples, baselines, simple comparisons, and plots.'],
  ['Validation', 'Test a known case, compare published results, hold out data, or vary assumptions.'],
  ['Limitations', 'State where your conclusion stops: sample, scale, uncertainty, simplification, or measurement.'],
  ['Iteration', 'Revise one element at a time so you can tell which change mattered.'],
  ['Final deliverable', 'Make the question, method, evidence, limitations, and materials inspectable.'],
]

export default function BuildProjectPage() {
  return (
    <>
      <RouteSeo path="/build-a-project" />
      <PageIntro eyebrow="From question to investigation" title="Build a project" description="A question becomes a project when you define what you can inspect, what evidence matters, and what result would make you revise." />
      <main id="main-content" className="page-content">
        <section className="split-section">
          <div><p className="eyebrow">The planning gap</p><h2>A question is not yet a project</h2></div>
          <div className="prose">
            <p>A workable project names a smallest informative investigation: a first attempt small enough to complete but real enough to expose a faulty assumption, weak measurement, failed proof route, or unhelpful comparison.</p>
            <p>The useful challenge depends on the work. Experiments may need a control, observational studies a confounder check, computation a baseline, simulation a sensitivity test, and mathematics a boundary case or counterexample.</p>
            <Link className="button primary" to="/investigation-planner">Open Investigation Planner</Link>
          </div>
        </section>
        <section><SectionHeading eyebrow="Project anatomy" title="Nine parts of an inspectable project" /><div className="build-grid">{BLOCKS.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section className="split-section">
          <div><p className="eyebrow">Try</p><h2>Your toy model should feel almost too simple</h2></div>
          <div className="prose"><p>Use one variable before ten, synthetic data before a difficult archive, a small sample before a full population, or a known case before an open problem.</p><p>The purpose is to discover whether your logic, code, measurement, and expected behavior make sense.</p></div>
        </section>
        <section><SectionHeading eyebrow="Public data checklist" title="Understand the dataset before interpreting it" /><div className="question-list horizontal"><p>Who collected it, and why?</p><p>What does one row represent?</p><p>What are the units?</p><p>What is missing?</p><p>What bias could collection introduce?</p><p>What license or privacy rules apply?</p></div></section>
        <aside className="callout"><div><p className="eyebrow">Possible outputs</p><h2>Match the format to the evidence.</h2></div><p>Mentor brief · methods sketch · evidence summary · paper · poster · notebook · annotated dataset · model · visualization · tool</p><Link className="button primary" to="/worksheet">Keep work in Research Record</Link></aside>
      </main>
    </>
  )
}

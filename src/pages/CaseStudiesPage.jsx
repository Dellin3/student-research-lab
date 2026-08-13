import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'

const WORKED_EXAMPLES = [
  {
    discipline: 'Mathematics',
    title: 'Local rules and resilient networks',
    steps: ['Network patterns', 'Graph connectivity under node removal', 'Which bounded graph families retain connectivity after one vertex is removed?', 'Enumerate small graphs and compare a simple resilience measure', 'Definitions, proofs for small cases, and reproducible enumeration', 'Small cases may suggest a false general rule; revise the family or claim'],
  },
  {
    discipline: 'Computer Science',
    title: 'Image classifiers under lighting changes',
    steps: ['Reliable machine learning', 'Robustness to controlled brightness shifts', 'How does one preprocessing choice affect accuracy under synthetic lighting changes?', 'Train a baseline on one public dataset and vary one transformation', 'Held-out accuracy, error examples, and run configuration', 'Synthetic shifts may not represent real cameras; narrow the claim'],
  },
  {
    discipline: 'Environmental Science · Biology',
    title: 'Tree canopy and neighborhood heat',
    steps: ['Urban ecology', 'Canopy cover and afternoon surface temperature', 'How are canopy and surface temperature associated within one city and summer?', 'Join two documented public datasets and inspect a small sample', 'Maps, distributions, association estimates, and data provenance', 'Association is not causation; revise around confounders and spatial scale'],
  },
  {
    discipline: 'Social Science',
    title: 'Retrieval practice and short-term recall',
    steps: ['How people learn', 'Spacing and retrieval in one study setting', 'How does spaced self-testing relate to recall after a fixed interval?', 'Pilot a transparent protocol with consent and minimal data collection', 'Protocol notes, anonymized measurements, uncertainty, and exclusions', 'A small convenience sample cannot support broad claims; revise the population and language'],
  },
  {
    discipline: 'Physics',
    title: 'Obstacle shape and wake patterns',
    steps: ['Motion in fluids', 'Wake formation behind simple shapes', 'How does obstacle geometry affect a measurable wake pattern in a low-cost setup?', 'Test two shapes at one flow setting and calibrate image measurements', 'Videos, measurement procedure, repeated observations, and uncertainty', 'The setup may not control flow well; revise the measurement or model scope'],
  },
]

const STEP_LABELS = ['Broad interest', 'Narrower phenomenon or structure', 'Question', 'Smallest investigation', 'Evidence', 'Likely limitation or revision']

export default function CaseStudiesPage() {
  return (
    <>
      <RouteSeo path="/case-studies" />
      <PageIntro eyebrow="Research in practice" title="Case studies across disciplines" description="These examples make narrowing, evidence, and revision visible. Worked examples are teaching constructions, not accounts of real students or completed results." />
      <main id="main-content" className="page-content case-page">
        <section>
          <SectionHeading eyebrow="Transfer the decisions" title="Five worked examples, one research logic" description="Each sketch stops before claiming a result. Its purpose is to show a feasible first investigation and the limitation likely to shape revision." />
          <div className="worked-examples">
            {WORKED_EXAMPLES.map(({ discipline, title, steps }) => (
              <article className="worked-example" key={discipline}>
                <div className="worked-example-heading"><p className="example-label">WORKED EXAMPLE</p><p className="eyebrow">{discipline}</p><h2>{title}</h2></div>
                <ol>{steps.map((step, index) => <li key={STEP_LABELS[index]}><span>{STEP_LABELS[index]}</span><p>{step}</p></li>)}</ol>
              </article>
            ))}
          </div>
        </section>
        <section className="real-project-example">
          <div>
            <p className="example-label">REAL PROJECT EXAMPLE</p>
            <p className="eyebrow">Physics · Astronomy · Applied mathematics</p>
            <h2>Saturn Rings Reconstruction Lab</h2>
          </div>
          <div>
            <p>An external project involving Cassini radio-occultation data, inverse problems, numerical diagnostics, and interactive tools. Inspect the actual artifact, then ask which decisions and limitations are documented.</p>
            <a className="text-link" href="https://primes-ring-website-p9yv.vercel.app/" target="_blank" rel="noopener noreferrer">Visit external project <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>
    </>
  )
}

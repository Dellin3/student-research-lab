import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import InvestigationPlanner from '../components/investigation-planner/InvestigationPlanner.jsx'
import '../components/investigation-planner/investigation-planner.css'
import { getRoute } from '../config/routes.js'
import { absoluteUrl } from '../config/site.js'

const PATH = '/investigation-planner'

export default function InvestigationPlannerPage() {
  const route = getRoute(PATH)
  const pageUrl = absoluteUrl(PATH)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: absoluteUrl('/tools') },
        { '@type': 'ListItem', position: 3, name: 'Investigation Planner', item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Investigation Planner',
      url: pageUrl,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      description: route.description,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ]

  return (
    <>
      <Seo
        title={route.title}
        description={route.description}
        pathname={PATH}
        jsonLd={structuredData}
      />

      <nav className="ip-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/tools">Tools</Link></li>
          <li aria-current="page">Investigation Planner</li>
        </ol>
      </nav>

      <section className="page-intro">
        <div className="narrow">
          <p className="eyebrow">Interactive research tool</p>
          <h1>Turn a Research Question into a Workable Investigation</h1>
          <p className="lead">
            Build a small first plan that connects your question to inspectable evidence, a research
            mode, a possible challenge, honest limits, and one action you can complete next.
          </p>
          <p>
            This deterministic planner organizes the words you enter. It does not certify novelty,
            feasibility, safety, ethics, truth, or publishability.
          </p>
        </div>
      </section>

      <main id="main-content" className="page-content ip-page">
        <InvestigationPlanner />

        <section className="ip-learn split-section">
          <div>
            <p className="eyebrow">Define the work</p>
            <h2>A question is not yet a project</h2>
          </div>
          <div className="prose">
            <p>A project connects the question to a method, inspectable evidence, a bounded first attempt, and a result that could challenge the current idea. Planning those links makes the next action concrete without pretending the design is already feasible or valid.</p>
          </div>
        </section>

        <section className="ip-learn" aria-labelledby="ip-modes-title">
          <div className="section-heading">
            <p className="eyebrow">Match method to question</p>
            <h2 id="ip-modes-title">Five ways an investigation can produce evidence</h2>
            <p>
              The mode changes what counts as a useful first test. It does not rank disciplines or
              imply that every project fits only one category.
            </p>
          </div>
          <div className="ip-learn-grid">
            <article>
              <h3>Mathematical / theoretical</h3>
              <p>Develop a proof, derivation, classification, bound, small-case computation, or counterexample.</p>
            </article>
            <article>
              <h3>Experimental</h3>
              <p>Change a condition deliberately, hold relevant factors steady, and record repeatable measurements.</p>
            </article>
            <article>
              <h3>Observational</h3>
              <p>Record or analyze what occurs without assigning a treatment, while naming selection limits and confounders.</p>
            </article>
            <article>
              <h3>Computational / data</h3>
              <p>Use a documented dataset, algorithm, representation, baseline, and metric to create inspectable results.</p>
            </article>
            <article>
              <h3>Model / simulation</h3>
              <p>Specify assumptions, vary parameters, check limiting cases, and compare output with a known target.</p>
            </article>
          </div>
        </section>

        <section className="ip-learn split-section">
          <div>
            <p className="eyebrow">Start smaller</p>
            <h2>Why plan the smallest investigation first?</h2>
          </div>
          <div className="prose">
            <p>
              A small investigation exposes missing data, weak definitions, unstable code, unsafe
              procedures, and unrealistic timing before those problems become expensive. Its purpose
              is to create an inspectable result, including a useful failure—not to settle the whole question.
            </p>
            <p>
              Bound the first attempt by one system, dataset slice, comparison, mathematical family,
              parameter, place, population, or time window. Record what the result cannot establish.
            </p>
          </div>
        </section>

        <section className="ip-learn" aria-labelledby="ip-evidence-title">
          <div className="section-heading">
            <p className="eyebrow">Interpret carefully</p>
            <h2 id="ip-evidence-title">What counts as evidence?</h2>
            <p>Evidence is an inspectable result that bears on the question: a proof step, counterexample, measurement, coded observation, benchmark result, model output, or documented source finding. A saved link or a confident explanation is not evidence by itself.</p>
          </div>
        </section>

        <section className="ip-learn" aria-labelledby="ip-challenge-title">
          <div className="section-heading">
            <p className="eyebrow">Evidence can disagree</p>
            <h2 id="ip-challenge-title">A workable plan includes a challenge path</h2>
            <p>
              Before beginning, name an observation, counterexample, failed baseline, sensitivity check,
              or null result that would make you revise the plan. This prevents the investigation from
              becoming a search only for support.
            </p>
          </div>
        </section>

        <section className="ip-learn split-section">
          <div>
            <p className="eyebrow">Continue the loop</p>
            <h2>Use literature to test the plan</h2>
          </div>
          <div className="prose">
            <p>
              Search for how experts define the evidence, choose methods, handle limitations, and report
              failed approaches. Verify every source you save. Then return and revise the plan rather than
              treating this first structure as final.
            </p>
            <p><Link to="/ai-literature">Continue to AI &amp; Literature</Link>.</p>
          </div>
        </section>

        <section className="ip-learn split-section">
          <div>
            <p className="eyebrow">Control the scope</p>
            <h2>What makes a plan too ambitious?</h2>
          </div>
          <div className="prose">
            <p>A first plan is probably too large when it needs unavailable participants, equipment, permissions, data, computing, or background knowledge before it can produce one inspectable result. Shrink the population, parameter range, dataset, theorem family, condition set, or model mechanism.</p>
          </div>
        </section>

        <section className="ip-learn split-section">
          <div>
            <p className="eyebrow">Expand from evidence</p>
            <h2>Move from a first investigation to a larger project</h2>
          </div>
          <div className="prose">
            <p>Use the first result to revise definitions, repair the method, add a meaningful comparison, or justify a wider scope. Expand one boundary at a time so you can explain what each new step contributed.</p>
          </div>
        </section>
      </main>
    </>
  )
}

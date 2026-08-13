import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import QuestionBuilderTool from '../components/question-builder/QuestionBuilderTool.jsx'
import { absoluteUrl, SITE } from '../config/site.js'
import { getRoute } from '../config/routes.js'
import '../components/question-builder/question-builder.css'

const route = getRoute('/research-question-builder')

export default function ResearchQuestionBuilderPage() {
  const pageUrl = absoluteUrl(route.path)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: absoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Research Question Builder',
          item: pageUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Research Question Builder',
      url: pageUrl,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: route.description,
      provider: {
        '@type': 'Organization',
        name: SITE.name,
        url: `${SITE.origin}/`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: 'Research Question Builder for High School Students',
      description: route.description,
      url: pageUrl,
      learningResourceType: 'Interactive resource',
      educationalLevel: 'High school',
      isAccessibleForFree: true,
      teaches: 'How to turn a broad interest into a testable research question',
    },
  ]

  return (
    <>
      <Seo
        title={route.title}
        description={route.description}
        pathname={route.path}
        jsonLd={structuredData}
      />

      <nav className="qb-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li aria-current="page">Research Question Builder</li>
        </ol>
      </nav>

      <section className="page-intro qb-intro">
        <div className="narrow">
          <p className="eyebrow">Interactive research tool</p>
          <h1>Turn an Interest into a Testable Research Question</h1>
          <p className="lead">
            Use this free builder to narrow a broad interest, identify variables and evidence,
            check project scope, and draft a focused high school research question. The tool is
            deterministic: every suggestion and diagnostic comes from the fields you can see.
          </p>
          <p className="qb-intro-note">
            This is research coaching encoded into an interface—not an AI chatbot and not a form
            that merely concatenates strings. If you only have an interest, start with{' '}
            <Link to="/topic-narrowing">Topic Narrowing Lab</Link>.
          </p>
        </div>
      </section>

      <main id="main-content" className="page-content qb-page">
        <QuestionBuilderTool />

        <section className="qb-learn" aria-labelledby="qb-learn-title">
          <div className="section-heading">
            <p className="eyebrow">Why the process matters</p>
            <h2 id="qb-learn-title">What makes a research question testable?</h2>
            <p>
              A testable question points to evidence that could support, weaken, or revise your idea.
              It names a setting, an observable target, and a relation you can inspect—measurement,
              comparison, model, classification, computation, or proof.
            </p>
          </div>
          <div className="qb-learn-grid">
            <article>
              <h3>Observable target</h3>
              <p>
                You can name what would change: a metric, peak structure, retention score, bound,
                or classification outcome.
              </p>
            </article>
            <article>
              <h3>Bounded setting</h3>
              <p>
                The question lives inside a dataset, population, laboratory system, theorem family,
                or time window—not “the world” in general.
              </p>
            </article>
            <article>
              <h3>Challenge path</h3>
              <p>
                Evidence could disagree with you. If nothing could fail, you still have a topic
                statement rather than a research question.
              </p>
            </article>
          </div>
        </section>

        <section className="qb-learn">
          <div className="section-heading">
            <h2>What is the difference between a topic and a research question?</h2>
            <p>
              A topic names a territory. A research question names a relation you can investigate
              with available methods and evidence.
            </p>
          </div>
          <div className="qb-compare-examples">
            <article>
              <p className="qb-label-tag">Topic</p>
              <h3>Machine learning in medicine</h3>
              <p>Important, but unbounded: no dataset, metric, model family, or decision.</p>
            </article>
            <article>
              <p className="qb-label-tag">Better direction</p>
              <h3>Classification performance on a specific public medical dataset</h3>
              <p>Now there is a setting and an outcome family, but still no controlled comparison.</p>
            </article>
            <article className="is-strong">
              <p className="qb-label-tag">Testable question</p>
              <h3>
                How does [specific preprocessing choice] affect [specific metric] for
                [classifier family] on [specific dataset]?
              </h3>
              <p>
                The third version is more useful because it tells you what to vary, what to measure,
                which model family to hold fixed, and which evidence to open first.
              </p>
            </article>
          </div>

          <div className="qb-compare-examples math-variant">
            <article>
              <p className="qb-label-tag">Topic</p>
              <h3>Graph theory</h3>
              <p>A field label. It does not yet identify a property, family, or claim.</p>
            </article>
            <article className="is-strong">
              <p className="qb-label-tag">Mathematical question</p>
              <h3>
                Under what conditions does [property] attain an extremal value among
                [bounded graph family], and how does the extremal structure change as
                [parameter] varies?
              </h3>
              <p>
                Mathematics often needs structure and conditions rather than a laboratory-style
                treatment/control design. The builder supports that difference.
              </p>
            </article>
          </div>
        </section>

        <section className="qb-learn split-section">
          <div>
            <h2>How narrow should a high school research question be?</h2>
          </div>
          <div className="prose">
            <p>
              Narrow enough that a student can complete a smallest version in weeks—not decades.
              Prefer one system, one comparison, one public dataset window, or one bounded mathematical
              family. Breadth can return later after the first inspectable result exists.
            </p>
            <p>
              Use the builder’s scope stage: if you cannot name the smallest version that could fail,
              the question is probably still too large.
            </p>
          </div>
        </section>

        <section className="qb-learn">
          <div className="section-heading">
            <h2>What counts as evidence?</h2>
            <p>
              Evidence is anything another person could inspect: a public dataset, simulation output,
              published measurement, experiment, survey, observational record, archive, benchmark,
              or a proof/derivation route. “I think papers exist” is a starting clue, not yet evidence access.
            </p>
          </div>
        </section>

        <section className="qb-learn split-section">
          <div>
            <h2>Can a research question change?</h2>
          </div>
          <div className="prose">
            <p>
              Yes—and it should when evidence forces revision. A good early question is a guide for
              the next search, not a vow. Document why the wording changed; that record is part of
              the research method. Continue in the{' '}
              <Link to="/research-workflow">research workflow</Link> after you{' '}
              <Link to="/research-question-builder">build a testable research question</Link>.
            </p>
          </div>
        </section>

        <section className="qb-learn">
          <div className="section-heading">
            <h2>What makes a research question too broad?</h2>
            <p>
              Broad questions usually name a field, a social problem, or an entire scientific domain
              without a phenomenon, bounded context, or evidence path.
            </p>
          </div>
          <div className="qb-learn-grid">
            <article>
              <h3>Too broad</h3>
              <p>“How does AI affect society?” or “What causes climate change?”</p>
            </article>
            <article>
              <h3>Closer</h3>
              <p>
                “How is neighborhood tree canopy associated with afternoon land surface temperature
                in one city during summer?”
              </p>
            </article>
            <article>
              <h3>Also too broad</h3>
              <p>
                Naming only “cancer,” “space,” or “mathematics” without a concrete phenomenon.
                Use the builder to{' '}
                <Link to="/find-a-direction">turn your topic into a research question</Link>{' '}
                and <Link to="/start-here">test whether your question is specific enough</Link>.
              </p>
            </article>
          </div>
        </section>

        <aside className="callout">
          <div>
            <p className="eyebrow">Next step</p>
            <h2>Carry the draft into a living worksheet.</h2>
          </div>
          <p>
            Once the question is specific enough for a first test, record sources, limitations,
            and the next concrete action.
          </p>
          <Link className="button primary" to="/worksheet">Open the worksheet</Link>
        </aside>
      </main>
    </>
  )
}

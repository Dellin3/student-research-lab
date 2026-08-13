import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import TopicNarrowingLab from '../components/topic-narrowing/TopicNarrowingLab.jsx'
import { absoluteUrl, SITE } from '../config/site.js'
import { getRoute } from '../config/routes.js'
import '../components/topic-narrowing/topic-narrowing.css'

const route = getRoute('/topic-narrowing')

export default function TopicNarrowingPage() {
  const pageUrl = absoluteUrl(route.path)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Topic Narrowing Lab', item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Topic Narrowing Lab',
      url: pageUrl,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: route.description,
      provider: { '@type': 'Organization', name: SITE.name, url: `${SITE.origin}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: 'How to narrow a research topic',
      description: route.description,
      url: pageUrl,
      learningResourceType: 'Interactive resource',
      educationalLevel: 'High school',
      isAccessibleForFree: true,
      teaches: 'How to turn a broad interest into a bounded research direction',
    },
  ]

  return (
    <>
      <Seo title={route.title} description={route.description} pathname={route.path} jsonLd={structuredData} />
      <nav className="tn-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/tools">Tools</Link></li>
          <li aria-current="page">Topic Narrowing Lab</li>
        </ol>
      </nav>
      <section className="page-intro">
        <div className="narrow">
          <p className="eyebrow">Interactive research tool</p>
          <h1>Turn an Interest into a Research Direction</h1>
          <p className="lead">
            Use this lab to move from a broad interest to one or more bounded research directions.
            It is a reasoning scaffold, not an AI topic generator and not a second question builder.
          </p>
        </div>
      </section>
      <main id="main-content" className="page-content tn-page">
        <TopicNarrowingLab />

        <section className="tn-learn" aria-labelledby="tn-levels-title">
          <div className="section-heading">
            <p className="eyebrow">Three different things</p>
            <h2 id="tn-levels-title">Interest vs topic vs research direction</h2>
            <p>Mixing these up is the usual reason a project stays too large to start.</p>
          </div>
          <div className="tn-learn-grid">
            <article>
              <h3>Interest</h3>
              <p>“Graph theory” or “urban heat” names what keeps pulling you back. It is not yet work you can inspect.</p>
            </article>
            <article>
              <h3>Direction</h3>
              <p>A direction names an object, a way of looking, and a boundary. Example: extremal behavior of triangle-free graphs under a fixed degree constraint.</p>
            </article>
            <article>
              <h3>Question</h3>
              <p>A question is a later formulation you can test, compute, or prove. Form that in the <Link to="/research-question-builder">Question Builder</Link>.</p>
            </article>
          </div>
        </section>

        <section className="tn-learn split-section">
          <div>
            <h2>Why broad topics fail</h2>
          </div>
          <div className="prose">
            <p>
              A broad topic has no object you can point to, no lens that would reveal something, and no
              boundary that would make a first attempt possible. It invites reading forever and testing never.
            </p>
            <p>
              Narrowing is not the same as making the idea less important. It is choosing one inspectable slice.
            </p>
          </div>
        </section>

        <section className="tn-learn">
          <div className="section-heading">
            <h2>Five useful ways to narrow a topic</h2>
          </div>
          <div className="tn-learn-grid">
            <article><h3>Name an object</h3><p>Replace the field with a structure, dataset, population, signal, or behavior.</p></article>
            <article><h3>Choose a lens</h3><p>Decide whether you are classifying, measuring, comparing, proving, or looking for a failure mode.</p></article>
            <article><h3>Add a boundary</h3><p>One dataset, theorem family, species, time window, model, or place is usually enough to start.</p></article>
            <article><h3>Keep the rest visible</h3><p>Write down what you are not studying yet so the project does not quietly expand.</p></article>
            <article><h3>Stop before the question</h3><p>A direction can be honest before it is testable. The question is the next reasoning step.</p></article>
          </div>
        </section>

        <section className="tn-learn">
          <div className="section-heading">
            <h2>How narrowing differs by discipline</h2>
            <p>Mathematics often narrows by structure, family, and conditions. Empirical fields often narrow by measurement, comparison, and setting. Computer science often narrows by representation, benchmark, or failure mode.</p>
          </div>
        </section>

        <section className="tn-learn split-section">
          <div>
            <h2>When a topic is narrow enough</h2>
          </div>
          <div className="prose">
            <p>
              It is narrow enough when you can name the object, the lens, and one boundary, and explain why
              that combination is smaller than the original interest. If you cannot yet say what you would
              inspect first, stay here. If you can, continue to a question.
            </p>
          </div>
        </section>

        <section className="tn-learn split-section">
          <div>
            <h2>How to move from direction to question</h2>
          </div>
          <div className="prose">
            <p>
              A direction says what you will look at. A question says what could come out differently.
              Carry the object and boundary into the <Link to="/research-question-builder">Question Builder</Link>.
              Do not treat the direction sentence as a finished research question.
            </p>
            <p>
              For the concepts behind this lab, read <Link to="/find-a-direction">Find a direction</Link>.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}

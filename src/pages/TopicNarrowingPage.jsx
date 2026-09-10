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
          <li><Link to="/start-here">Start research</Link></li>
          <li aria-current="page">Topic Narrowing Lab</li>
        </ol>
      </nav>
      <section className="page-intro">
        <div className="narrow">
          <p className="eyebrow">Interactive research tool</p>
          <h1>Find a direction.</h1>
          <p className="lead">Choose an object, a way of looking, and one boundary.</p>
        </div>
      </section>
      <main id="main-content" className="page-content tn-page">
        <TopicNarrowingLab />
        <aside className="tool-guidance"><p>A direction is ready when you can name what you would inspect first.</p><Link to="/find-a-direction">How to narrow a topic ↗</Link></aside>
      </main>
    </>
  )
}

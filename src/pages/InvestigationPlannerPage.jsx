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
          <li><Link to="/start-here">Start research</Link></li>
          <li aria-current="page">Investigation Planner</li>
        </ol>
      </nav>

      <section className="page-intro">
        <div className="narrow">
          <p className="eyebrow">Interactive research tool</p>
          <h1>Plan the first test.</h1>
          <p className="lead">Choose evidence, a comparison, and one action you can take next.</p>
        </div>
      </section>

      <main id="main-content" className="page-content ip-page">
        <InvestigationPlanner />
        <aside className="tool-guidance"><p>Check the method, data access, and permissions with a teacher or mentor before starting.</p><Link to="/build-a-project">How to design an investigation ↗</Link></aside>
      </main>
    </>
  )
}

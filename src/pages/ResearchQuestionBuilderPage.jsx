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
          <li><Link to="/start-here">Start research</Link></li>
          <li aria-current="page">Research Question Builder</li>
        </ol>
      </nav>

      <section className="page-intro qb-intro">
        <div className="narrow">
          <p className="eyebrow">Interactive research tool</p>
          <h1>Shape <em>your question.</em></h1>
          <p className="lead">Name what you will compare, measure, compute, or prove.</p>
        </div>
      </section>

      <main id="main-content" className="page-content qb-page">
        <QuestionBuilderTool />
        <aside className="tool-guidance"><p>A useful question names a bounded setting and evidence that could change your answer.</p><Link to="/case-studies">See worked examples ↗</Link></aside>
      </main>
    </>
  )
}

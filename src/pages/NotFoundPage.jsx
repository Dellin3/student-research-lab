import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo.jsx'

export default function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <>
      <Seo
        title="Page Not Found | Research Starter Lab"
        description="The requested page could not be found. Return to Research Starter Lab or begin with the student research pathway."
        pathname={pathname}
        noindex
      />
      <main id="main-content" className="not-found">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist or may have moved.</p>
        <div className="button-row">
          <Link className="button primary" to="/">Return home</Link>
          <Link className="button secondary" to="/start-here">Start Here</Link>
        </div>
      </main>
    </>
  )
}

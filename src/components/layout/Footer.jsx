import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="footer-brand" to="/">Research Starter Lab</Link>
        <p>A practical path from curiosity to careful, inspectable student research.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link to="/start-here">Start</Link>
        <Link to="/learn">Learn</Link>
        <Link to="/tools">Tools</Link>
        <Link to="/case-studies">Examples</Link>
        <Link to="/worksheet">Research Record</Link>
      </nav>
    </footer>
  )
}

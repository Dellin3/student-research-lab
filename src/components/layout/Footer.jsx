import { Link } from 'react-router-dom'
export default function Footer() {
  return <footer className="site-footer"><Link className="footer-brand" to="/">Research Starter Lab</Link><nav className="footer-links" aria-label="Footer navigation"><Link to="/start-here">Start here</Link><Link to="/case-studies">Examples</Link><Link to="/worksheet">My record</Link></nav></footer>
}

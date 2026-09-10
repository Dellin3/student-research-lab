import { Link } from 'react-router-dom'
export default function Footer() {
  return <footer className="site-footer"><div><Link className="footer-brand" to="/">Research Starter Lab<span aria-hidden="true"> ↗</span></Link><p>An independent student resource. Built for curious minds.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link to="/start-here">Start research</Link><Link to="/resources">Mentors & programs</Link><Link to="/worksheet">My notes</Link></nav></footer>
}

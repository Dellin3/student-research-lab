import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SAVED_RESEARCH_KEYS } from '../../utils/savedResearch.js'

export default function Footer() {
  const [hasNotes, setHasNotes] = useState(false)
  useEffect(() => {
    try { setHasNotes(SAVED_RESEARCH_KEYS.some(key => window.localStorage.getItem(key) !== null)) } catch { /* Browser storage may be disabled. */ }
  }, [])
  return <footer className="site-footer"><div><Link className="footer-brand" to="/">Research Starter Lab</Link><p>An independent student resource.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link to="/start-here">Start on your own</Link><Link to="/resources">Find a program</Link>{hasNotes && <Link to="/worksheet">Download previous notes</Link>}</nav></footer>
}

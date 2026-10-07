import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { SAVED_RESEARCH_KEYS } from '../../utils/savedResearch.js'

function subscribeToNotes(onChange) {
  const handleStorage = event => {
    if (event.key === null || SAVED_RESEARCH_KEYS.includes(event.key)) onChange()
  }
  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}

function hasSavedNotes() {
  try { return SAVED_RESEARCH_KEYS.some(key => window.localStorage.getItem(key) !== null) }
  catch { return false }
}

function noServerNotes() { return false }

export default function Footer() {
  const hasNotes = useSyncExternalStore(subscribeToNotes, hasSavedNotes, noServerNotes)
  return <footer className="site-footer"><div><Link className="footer-brand" to="/">Research Starter Lab</Link><p>An independent student resource.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link to="/start-here">Start on your own</Link><Link to="/resources">Find a program</Link><Link to="/guides/research-without-a-mentor">Research guides</Link>{hasNotes && <Link to="/worksheet">Download previous notes</Link>}</nav></footer>
}

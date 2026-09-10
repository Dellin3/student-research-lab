import { Link, useSearchParams } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { MENTOR_DIRECTORIES, PROGRAMS, RESOURCES, RESOURCE_CHECKED_DATE } from '../data/resources.js'

const VIEWS = [['programs', 'Research programs'], ['mentors', 'Find a mentor'], ['sources', 'Papers & data']]
const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
function matches(resource, query) {
  const haystack = normalize(Object.values(resource).join(' '))
  return normalize(query).trim().split(/\s+/).filter(Boolean).every(word => haystack.includes(word))
}
function ExternalLink({ href, children, className }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a>
}
export default function ResourcesPage() {
  const [params, setParams] = useSearchParams()
  const view = VIEWS.some(([id]) => id === params.get('view')) ? params.get('view') : 'programs'
  const query = params.get('q') || ''
  const format = ['Remote', 'In person', 'Varies by project'].includes(params.get('format')) ? params.get('format') : 'All'
  const catalog = view === 'sources' ? RESOURCES : PROGRAMS
  const results = catalog.filter(item => matches(item, query) && (view !== 'programs' || format === 'All' || item.format === format))
  function changeFilter(key, value) {
    const next = new URLSearchParams(params)
    if (value && value !== 'All') next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return <>
    <RouteSeo path="/resources" />
    <main id="main-content" className="find-page">
      <header className="hub-heading find-heading"><p className="eyebrow">02 / Find support</p><h1>Find your <em>way in.</em></h1><p>Research programs. People to ask. Sources to explore.<br />A short list of useful places, with links straight to the source.</p></header>
      <nav className="resource-tabs" aria-label="Resource categories">{VIEWS.map(([id, label]) => <Link key={id} to={`/resources?view=${id}`} aria-current={view === id ? 'page' : undefined}>{label}<span aria-hidden="true">↗</span></Link>)}</nav>
      {view === 'mentors' ? <section className="mentor-content" aria-labelledby="mentor-title">
        <div className="mentor-first"><div className="mentor-first-copy"><p className="eyebrow">Start close to home</p><h2 id="mentor-title">Your first mentor<br />might be a teacher.</h2><p>Ask a teacher in a subject you enjoy, or your school counselor. Bring one question and ask for a suggestion, feedback, or an introduction.</p><Link className="inline-action" to="/outreach">Help me write a first message <span aria-hidden="true">→</span></Link></div><blockquote><span>A simple way to ask</span><p>“I’m interested in [topic] and want to try a small research project. Could you suggest a starting question or someone I should talk to?”</p></blockquote></div>
        <div className="mentor-directory-heading"><div><h2>Look for shared interests.</h2><p>Use a university directory to find researchers working on your topic.</p></div><span className="directory-label">Official university directories</span></div>
        <div className="mentor-directory-list">{MENTOR_DIRECTORIES.map(item => <article key={item.id}><p className="resource-organization">{item.source}</p><h3><ExternalLink href={item.href}>{item.title}</ExternalLink></h3><p>{item.description}</p></article>)}</div>
        <p className="resource-footnote">These are research directories, not mentor-matching services. Check each person’s profile and whether they work with high-school students before contacting them.</p>
        <div className="mentor-next"><div><h3>Found someone relevant?</h3><p>Read about their work. Mention a specific connection, and ask one small, answerable question.</p></div><Link className="button primary" to="/outreach">Prepare my message <span aria-hidden="true">→</span></Link></div>
      </section> : <section className="catalog-section" aria-labelledby="catalog-title">
        <div className="catalog-heading"><div><h2 id="catalog-title">{view === 'programs' ? 'Find a good fit.' : 'Start with a useful source.'}</h2><p>{view === 'programs' ? 'Check the fit first: subject, preparation, location, and time.' : 'You only need a few relevant sources to begin.'}</p></div><span className="checked-date">Sources checked {RESOURCE_CHECKED_DATE}</span></div>
        <form className="finder-controls" role="search" onSubmit={event => event.preventDefault()}>
          <label className="finder-search"><span className="sr-only">Search {view === 'programs' ? 'programs' : 'sources'}</span><span className="search-icon" aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => changeFilter('q', event.target.value)} placeholder={view === 'programs' ? 'Search a topic, program, or location…' : 'Search papers, data, citations…'} /></label>
          {view === 'programs' && <label className="finder-format"><span>Format</span><select value={format} onChange={event => changeFilter('format', event.target.value)}><option value="All">All formats</option><option>Remote</option><option>In person</option><option>Varies by project</option></select></label>}
        </form>
        <p className="finder-count" role="status">{results.length} {view === 'programs' ? (results.length === 1 ? 'opportunity' : 'opportunities') : (results.length === 1 ? 'source' : 'sources')}{query ? ` matching “${query}”` : ''}{format !== 'All' && view === 'programs' ? ` · ${format}` : ''}</p>
        <div className="program-list">{results.map((item, i) => <article key={item.id} className="program-row"><span className="catalog-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><div className="program-main"><p className="resource-organization">{item.organization || item.source}</p><h3><ExternalLink href={item.href}>{item.title}</ExternalLink></h3>{item.fullName && <p className="program-fullname">{item.fullName}</p>}<p className="program-description">{item.description}</p>{item.audience && <p className="program-audience"><strong>Who it’s for</strong> {item.audience}</p>}{item.note && <p className="program-note">{item.note}</p>}{item.sourceHref && <ExternalLink className="program-source" href={item.sourceHref}>Program details from MIT</ExternalLink>}</div><div className="program-facts">{item.format ? <><span className={`format-tag ${item.format === 'Remote' ? 'is-remote' : ''}`}>{item.format}</span><span>{item.location}</span>{item.cost && <span className="cost-tag">{item.cost}</span>}</> : <span className="format-tag">{item.category}</span>}</div></article>)}</div>
        {results.length === 0 && <div className="finder-empty"><h3>No matches yet.</h3><p>Try a broader topic, or remove the format filter.</p><button className="button secondary" type="button" onClick={() => setParams({view}, {replace: true, preventScrollReset: true})}>Clear filters</button></div>}
        <div className="catalog-note"><span aria-hidden="true">↗</span><p>{view === 'programs' ? 'Program rules and application dates can change. Use the official page for current eligibility, fees, and deadlines. This list does not indicate whether applications are open.' : <>Need help making sense of a paper? <Link to="/ai-literature">Read the short literature guide.</Link></>}</p></div>
      </section>}
    </main>
  </>
}

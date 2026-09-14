import { useSearchParams } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { MENTOR_DIRECTORIES, PROGRAMS, RESOURCES, RESOURCE_CHECKED_DATE } from '../data/resources.js'
import { ELIGIBILITY_FILTERS, FORMAT_FILTERS, filterPrograms } from '../utils/programFinder.js'

function External({ href, children, className, label }) {
  return <a href={href} className={className} aria-label={label} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a>
}
export default function ResourcesPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const eligibility = ELIGIBILITY_FILTERS.some(([value]) => value === params.get('eligibility')) ? params.get('eligibility') : 'all'
  const requestedFormat = params.get('format') === 'Varies by project' ? 'Mixed / varies' : params.get('format')
  const format = FORMAT_FILTERS.includes(requestedFormat) ? requestedFormat : 'All formats'
  const results = filterPrograms(PROGRAMS, { q: query, eligibility, format })
  const filtered = Boolean(query || eligibility !== 'all' || format !== 'All formats')
  function changeFilter(key, value) {
    const next = new URLSearchParams(params)
    next.delete('view')
    if (value && value !== 'all' && value !== 'All formats') next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return <><RouteSeo path="/resources" /><main id="main-content" className="resource-page">
    <header className="hub-heading directory-heading"><p className="eyebrow">02 / Find an opportunity</p><h1>Find your <em>way in.</em></h1><p>Research programs with clear eligibility and direct official links.</p></header>
    <nav className="directory-jumps" aria-label="On this page"><a href="#programs">Research programs</a><a href="#sources">Papers & data</a><a href="#mentors">People to ask</a></nav>
    <section id="programs" aria-labelledby="programs-title">
      <div className="directory-section-heading"><h2 id="programs-title">Research programs</h2><span>{PROGRAMS.length} places to explore</span></div>
      <form className="directory-filters" role="search" onSubmit={event => event.preventDefault()}>
        <label><span>Search</span><input type="search" value={query} placeholder="Program, subject, university…" onChange={event => changeFilter('q', event.target.value)} /></label>
        <label><span>Eligibility</span><select value={eligibility} onChange={event => changeFilter('eligibility', event.target.value)}>{ELIGIBILITY_FILTERS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Format</span><select value={format} onChange={event => changeFilter('format', event.target.value)}>{FORMAT_FILTERS.map(value => <option key={value}>{value}</option>)}</select></label>
      </form>
      <p className="eligibility-guide">International nationality and U.S. residence are different. Read each program’s conditions; these filters do not determine your eligibility.</p>
      <div className="directory-result-bar"><p role="status">{results.length} of {PROGRAMS.length} programs{query ? ` matching “${query}”` : ''}</p>{filtered && <button type="button" onClick={() => setParams({}, {replace:true, preventScrollReset:true})}>Clear filters</button>}</div>
      <div className="opportunity-list">{results.map(item => <article className="opportunity-row" key={item.id} aria-labelledby={`program-${item.id}`}>
        <div className="opportunity-main"><p className="program-org">{item.organization}</p><h3 id={`program-${item.id}`}><External href={item.href}>{item.title}</External></h3>{item.fullName && <p className="program-expansion">{item.fullName}</p>}<p>{item.description}</p><p className="program-subject">{item.subject} · {item.type}</p></div>
        <div className="opportunity-eligibility"><span className={`eligibility-badge is-${item.eligibilityGroup}`}>{item.eligibilityLabel}</span><p>{item.eligibility}</p><p className="program-audience">{item.audience}</p></div>
        <div className="opportunity-actions"><p className="program-format">{item.format}</p><p>{item.location}</p><External className="official-button" href={item.href} label={`Official website: ${item.title} (opens in a new tab)`}>Official website</External><External className="eligibility-source" href={item.eligibilityHref} label={`Eligibility source: ${item.title} (opens in a new tab)`}>Eligibility source</External>{item.admissionsHref && <External className="eligibility-source" href={item.admissionsHref} label={`Application requirements: ${item.title} (opens in a new tab)`}>Requirements</External>}<small>{item.cycle}</small></div>
      </article>)}</div>
      {!results.length && <div className="directory-empty"><h3>No matching programs.</h3><p>Try a broader search or clear a filter.</p><button type="button" className="button secondary" onClick={() => setParams({}, {replace:true, preventScrollReset:true})}>Show all programs</button></div>}
      <p className="directory-note">Official sources checked {RESOURCE_CHECKED_DATE}. Some pages still describe 2026; each entry names the guidance used. Check official pages for the next cycle’s full requirements, fees, and dates. Listing a program does not mean applications are open.</p>
    </section>
    <section id="sources" className="resource-essentials" aria-labelledby="sources-title"><div className="directory-section-heading"><h2 id="sources-title">Papers, data & references</h2></div><div className="essential-links">{RESOURCES.map(item => <div className="essential-row" key={item.id}><div><h3>{item.title}</h3><p>{item.description}</p></div><External href={item.href} label={`Open ${item.title} (opens in a new tab)`}>Open {item.category === 'Search help' ? 'guide' : item.category.toLowerCase()}</External></div>)}</div></section>
    <section id="mentors" className="resource-mentors" aria-labelledby="mentors-title"><div className="directory-section-heading"><h2 id="mentors-title">Need someone to ask?</h2></div><p>Start with a subject teacher or school counselor. Share your question and what you have tried, then ask for one suggestion. For a specialist, look for a researcher whose work connects to your topic.</p><div className="mentor-quick-links">{MENTOR_DIRECTORIES.map(item => <External key={item.id} href={item.href}>{item.title}</External>)}</div><p className="directory-note">These are researcher directories. Check whether a researcher works with high-school students before contacting them.</p></section>
  </main></>
}

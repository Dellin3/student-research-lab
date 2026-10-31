import { useMemo, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { MENTOR_DIRECTORIES, PROGRAMS, RESOURCE_GROUPS, RESOURCES, RESOURCE_CHECKED_DATE } from '../data/resources.js'
import { ELIGIBILITY_FILTERS, FORMAT_FILTERS, SUBJECT_FILTERS, filterPrograms, parseProgramIds, programListPath } from '../utils/programFinder.js'
import { savedPrograms } from '../lib/savedPrograms.js'

const PROGRAM_IDS = new Set(PROGRAMS.map(item => item.id))
const STORAGE_WARNING = 'This browser is not keeping your list after you leave the page. Copy the link to your list to keep it.'
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

function External({ href, children, className, label }) {
  return <a href={href} className={className} aria-label={label} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a>
}
export default function ResourcesPage() {
  const [params, setParams] = useSearchParams()
  const storedIds = useSyncExternalStore(savedPrograms.subscribe, savedPrograms.getSnapshot, savedPrograms.getServerSnapshot)
  const saved = useMemo(() => storedIds.filter(id => PROGRAM_IDS.has(id)), [storedIds])
  const savedSet = new Set(saved)
  const [notice, setNotice] = useState(null)
  const query = params.get('q') || ''
  const eligibility = ELIGIBILITY_FILTERS.some(([value]) => value === params.get('eligibility')) ? params.get('eligibility') : 'all'
  const requestedFormat = params.get('format') === 'Varies by project' ? 'Mixed / varies' : params.get('format')
  const format = FORMAT_FILTERS.includes(requestedFormat) ? requestedFormat : 'All formats'
  const subject = SUBJECT_FILTERS.some(([value]) => value === params.get('subject')) ? params.get('subject') : 'all'
  const shared = parseProgramIds(params.get('programs'), PROGRAMS)
  const savedOnly = !shared.length && params.get('saved') === '1'
  const results = filterPrograms(PROGRAMS, { q: query, eligibility, format, subject, ids: shared.length ? shared : savedOnly ? saved : null })
  const filtered = Boolean(query || eligibility !== 'all' || format !== 'All formats' || subject !== 'all' || savedOnly || shared.length)
  const sharedUnsaved = shared.filter(id => !savedSet.has(id))

  function update(changes) {
    const next = new URLSearchParams(params)
    next.delete('view')
    for (const [key, value] of Object.entries(changes)) {
      if (value && value !== 'all' && value !== 'All formats') next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true, preventScrollReset: true })
  }
  function clearFilters() {
    setNotice(null)
    setParams({}, { replace: true, preventScrollReset: true })
  }
  function showMyList(on) {
    setNotice(null)
    update({ saved: on ? '1' : '', programs: '' })
  }
  function toggle(id) {
    setNotice(savedPrograms.toggle(id) ? null : { text: STORAGE_WARNING })
  }
  function saveShared() {
    const added = sharedUnsaved.length
    setNotice({ text: savedPrograms.add(shared) ? `Added ${plural(added, 'program')} to your list.` : STORAGE_WARNING })
  }
  async function copyListLink() {
    const url = new URL(programListPath(saved), window.location.origin).href
    try {
      await navigator.clipboard.writeText(url)
      setNotice({ text: `Link copied. It shows these ${plural(saved.length, 'program')} to anyone who opens it.` })
    } catch {
      setNotice({ text: 'Copy this link to share your list:', url })
    }
  }
  const resultText = `${results.length} of ${PROGRAMS.length} programs${query ? ` matching “${query}”` : ''}${savedOnly ? ' in my list' : ''}${shared.length ? ' in the shared list' : ''}`

  return <><RouteSeo path="/resources" /><main id="main-content" className="resource-page">
    <header className="hub-heading directory-heading"><p className="eyebrow">02 / Find an opportunity</p><h1>Find your <em>way in.</em></h1><p>Research programs with clear eligibility and direct official links.</p></header>
    <nav className="directory-jumps" aria-label="On this page"><a href="#programs">Research programs</a><a href="#sources">Papers & data</a><a href="#mentors">People to ask</a></nav>
    <section id="programs" aria-labelledby="programs-title">
      <div className="directory-section-heading"><h2 id="programs-title">Research programs</h2><span>{PROGRAMS.length} places to explore</span></div>
      <form className="directory-filters" role="search" onSubmit={event => event.preventDefault()}>
        <label><span>Search</span><input type="search" value={query} placeholder="Program, subject, university…" onChange={event => update({ q: event.target.value })} /></label>
        <label><span>Subject</span><select value={subject} onChange={event => update({ subject: event.target.value })}>{SUBJECT_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Eligibility</span><select value={eligibility} onChange={event => update({ eligibility: event.target.value })}>{ELIGIBILITY_FILTERS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Format</span><select value={format} onChange={event => update({ format: event.target.value })}>{FORMAT_FILTERS.map(value => <option key={value}>{value}</option>)}</select></label>
      </form>
      <p className="eligibility-guide">International nationality and U.S. residence are different. Read each program’s conditions; these filters do not determine your eligibility.</p>
      <div className="directory-result-bar">
        <p role="status">{resultText}</p>
        <div className="directory-result-actions">
          <label className="list-toggle"><input type="checkbox" checked={savedOnly} onChange={event => showMyList(event.target.checked)} />Show only my list ({saved.length})</label>
          {saved.length > 0 && <button type="button" onClick={copyListLink}>Copy link to my list</button>}
          {filtered && <button type="button" onClick={clearFilters}>Clear filters</button>}
        </div>
      </div>
      <div className="list-notice-region" role="status">{notice && <div className="list-notice"><p>{notice.text}</p>{notice.url && <input type="text" readOnly value={notice.url} aria-label="Link to your list" onFocus={event => event.target.select()} />}</div>}</div>
      {shared.length > 0 && <div className="shared-list-banner"><p><strong>Shared list.</strong> This link shows {plural(shared.length, 'program')}.</p><div>{sharedUnsaved.length > 0 ? <button type="button" className="plain-action" onClick={saveShared}>Save {sharedUnsaved.length === shared.length ? 'these' : `the ${sharedUnsaved.length} new`} to my list</button> : <span>All are in your list.</span>}<button type="button" className="plain-action" onClick={clearFilters}>Show all programs</button></div></div>}
      <div className="opportunity-list">{results.map(item => <article className="opportunity-row" key={item.id} aria-labelledby={`program-${item.id}`}>
        <div className="opportunity-main"><p className="program-org">{item.organization}</p><h3 id={`program-${item.id}`}><External href={item.href}>{item.title}</External></h3>{item.fullName && <p className="program-expansion">{item.fullName}</p>}<p>{item.description}</p><p className="program-subject">{item.subject} · {item.type}</p></div>
        <div className="opportunity-eligibility"><span className={`eligibility-badge is-${item.eligibilityGroup}`}>{item.eligibilityLabel}</span><p>{item.eligibility}</p><p className="program-audience">{item.audience}</p></div>
        <div className="opportunity-actions"><p className="program-format">{item.format}</p><p>{item.location}</p><External className="official-button" href={item.href} label={`Official website: ${item.title} (opens in a new tab)`}>Official website</External><External className="eligibility-source" href={item.eligibilityHref} label={`Eligibility source: ${item.title} (opens in a new tab)`}>Eligibility source</External>{item.admissionsHref && <External className="eligibility-source" href={item.admissionsHref} label={`Application requirements: ${item.title} (opens in a new tab)`}>Requirements</External>}<small>{item.cycle}</small><label className={`save-program${savedSet.has(item.id) ? ' is-saved' : ''}`}><input type="checkbox" aria-label={`Save to my list: ${item.title}`} checked={savedSet.has(item.id)} onChange={() => toggle(item.id)} />Save to my list</label></div>
      </article>)}</div>
      {!results.length && (savedOnly && !saved.length
        ? <div className="directory-empty"><h3>Your list is empty.</h3><p>Choose “Save to my list” on any program to keep it here. Your list stays in this browser; no account is needed.</p><button type="button" className="button secondary" onClick={() => showMyList(false)}>Show all programs</button></div>
        : <div className="directory-empty"><h3>No matching programs.</h3><p>Try a broader search or clear a filter.</p><button type="button" className="button secondary" onClick={clearFilters}>Show all programs</button></div>)}
      <p className="directory-note">Official sources checked {RESOURCE_CHECKED_DATE}. Some pages still describe 2026; each entry names the guidance used. Check official pages for the next cycle’s full requirements, fees, and dates. Listing a program does not mean applications are open.</p>
    </section>
    <section id="sources" className="resource-essentials" aria-labelledby="sources-title"><div className="directory-section-heading"><h2 id="sources-title">Papers, data & references</h2><span>{RESOURCES.length} free websites</span></div>
      {RESOURCE_GROUPS.map(group => <div className="resource-group" key={group.id}><h3 id={`resources-${group.id}`}>{group.title}</h3><p className="resource-group-note">{group.description}</p><ul className="essential-links" aria-labelledby={`resources-${group.id}`}>{RESOURCES.filter(item => item.group === group.id).map(item => <li className="essential-row" key={item.id}><div><h4>{item.title}</h4><p>{item.description}</p><p className="resource-subjects">{item.subjects}</p></div><External href={item.href} label={`${item.action}: ${item.title} (opens in a new tab)`}>{item.action}</External></li>)}</ul></div>)}
    </section>
    <section id="mentors" className="resource-mentors" aria-labelledby="mentors-title"><div className="directory-section-heading"><h2 id="mentors-title">Need someone to ask?</h2></div><p>Start with a subject teacher or school counselor. Share your question and what you have tried, then ask for one suggestion. For a specialist, look for a researcher whose work connects to your topic.</p><div className="mentor-quick-links">{MENTOR_DIRECTORIES.map(item => <External key={item.id} href={item.href}>{item.title}</External>)}</div><p className="directory-note">These are researcher directories. Check whether a researcher works with high-school students before contacting them.</p></section>
  </main></>
}

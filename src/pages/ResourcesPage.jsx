import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { RESOURCES } from '../data/resources.js'

export default function ResourcesPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', ...new Set(RESOURCES.map(resource => resource.category))]
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const results = RESOURCES.filter(resource => (category === 'All' || resource.category === category) && words.every(word => `${resource.title} ${resource.category} ${resource.description} ${resource.fullName || ''}`.toLowerCase().includes(word)))
  return <><RouteSeo path="/resources" /><PageIntro eyebrow="Research resources" title="Find a useful starting point." description="Papers, data, tools, and research opportunities. Go straight to the source." />
    <main id="main-content" className="page-content resource-page">
      <form className="resource-controls" onSubmit={event => event.preventDefault()} role="search">
        <label><span>Search resources</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Papers, datasets, research programs…" /></label>
        <label><span>Type</span><select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(value=><option key={value}>{value}</option>)}</select></label>
      </form>
      <p className="resource-count" role="status">{results.length} {results.length === 1 ? 'resource' : 'resources'}</p>
      <div className="resource-list">{results.map(resource => <article className="resource-row" key={resource.id}>
        <span className="resource-type">{resource.category}</span><div><h2><a href={resource.href} target="_blank" rel="noopener noreferrer">{resource.title}<span className="sr-only"> — opens in a new tab</span> <span aria-hidden="true">↗</span></a></h2><p>{resource.description}</p>{resource.fullName && <p className="resource-source">{resource.fullName}</p>}<span className="resource-source">{resource.source}</span></div>
      </article>)}</div>
      {results.length === 0 && <div className="resource-empty"><h2>No matching resources.</h2><p>Try a broader term or another type.</p><button className="button secondary" type="button" onClick={()=>{setQuery('');setCategory('All')}}>Clear filters</button></div>}
      <p className="hub-footnote">Need help using a source? <Link to="/ai-literature">Read the literature guide.</Link> For program dates and requirements, check the official page.</p>
    </main></>
}

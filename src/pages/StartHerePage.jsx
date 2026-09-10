import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import RouteSeo from '../components/layout/RouteSeo.jsx'
import { RESEARCH_STEPS, STARTER_EXAMPLES } from '../data/researchSteps.js'

export default function StartHerePage() {
  const [params, setParams] = useSearchParams()
  const stageIndex = Math.max(0, RESEARCH_STEPS.findIndex(step => step.id === params.get('step')))
  const exampleIndex = Math.max(0, STARTER_EXAMPLES.findIndex(item => item.id === params.get('example')))
  const step = RESEARCH_STEPS[stageIndex]
  const example = STARTER_EXAMPLES[exampleIndex]
  const exampleStep = example.steps[stageIndex]
  const [showMore, setShowMore] = useState(false)
  function selectStep(index) {
    setParams({ example: example.id, step: RESEARCH_STEPS[index].id }, { preventScrollReset: true })
  }
  return <>
    <RouteSeo path="/start-here" />
    <main id="main-content" className="begin-page">
      <header className="hub-heading"><p className="eyebrow">01 / Start research</p><h1>You can start <em>small.</em></h1><p>One question. A little reading. One real attempt.<br />Follow these four steps at your own pace.</p></header>
      <div className="begin-workspace">
        <nav className="begin-steps" aria-label="Getting started steps">{RESEARCH_STEPS.map((item, i) => <button type="button" key={item.id} onClick={() => selectStep(i)} aria-current={i === stageIndex ? 'step' : undefined} aria-controls="begin-step-content"><span className="step-number">0{i + 1}</span><span>{item.label}</span><span className="step-pointer" aria-hidden="true">→</span></button>)}</nav>
        <section className="begin-step" id="begin-step-content" aria-labelledby="step-heading">
          <div className="begin-step-copy" key={step.id}>
            <p className="step-meta">STEP 0{stageIndex + 1} OF 04</p><h2 id="step-heading">{step.title}</h2><p>{step.description}</p>
            <ul className="action-list">{step.actions.map(text => <li key={text}>{text}</li>)}</ul>
            <div className="begin-tool-links"><Link className="button primary" to={step.link}>{step.linkLabel} <span aria-hidden="true">↗</span></Link><Link className="inline-action" to={step.alternative[0]}>{step.alternative[1]} <span aria-hidden="true">→</span></Link></div>
          </div>
          <aside className="begin-example" aria-label="Worked example">
            <div className="begin-example-top"><span className="worked-label">Worked example</span><label className="example-select"><span className="sr-only">Example field</span><select value={example.id} onChange={event => setParams({ example: event.target.value, step: step.id }, { preventScrollReset: true })}>{STARTER_EXAMPLES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></div>
            <div key={`${example.id}-${step.id}`} className="example-step-detail" aria-live="polite" aria-atomic="true"><h3>{exampleStep[0]}</h3><p>{exampleStep[1]}</p><div className="example-takeaway"><span>{exampleStep[2]}</span><p>{exampleStep[3]}</p></div></div>
          </aside>
          <div className="begin-pagination"><button type="button" className="inline-action" disabled={stageIndex === 0} onClick={() => selectStep(stageIndex - 1)}>← Previous</button><span>0{stageIndex + 1} / 04</span>{stageIndex < 3 ? <button type="button" className="inline-action" onClick={() => selectStep(stageIndex + 1)}>Next step →</button> : <Link className="inline-action" to="/worksheet">Open my notes →</Link>}</div>
        </section>
      </div>
      <section className="begin-help"><div><h2>A little help when you need it.</h2><p>Start with the steps above. These short guides are here if you get stuck.</p></div><button className="inline-action" type="button" aria-expanded={showMore} aria-controls="extra-guides" onClick={() => setShowMore(!showMore)}>{showMore ? 'Hide guides −' : 'Show guides +'}</button>
        <div id="extra-guides" className="begin-extra" hidden={!showMore}><Link to="/case-studies">Examples in other fields ↗</Link><Link to="/research-workflow">When your result is unexpected ↗</Link><Link to="/ai-literature">Reading papers & using AI ↗</Link></div>
      </section>
    </main>
  </>
}

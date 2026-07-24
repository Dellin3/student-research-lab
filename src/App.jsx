import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'

const NAV_ITEMS = [
  ['/', 'Home'],
  ['/start-here', 'Start Here'],
  ['/find-a-direction', 'Find a Direction'],
  ['/research-workflow', 'Research Workflow'],
  ['/ai-literature', 'AI & Literature'],
  ['/build-a-project', 'Build a Project'],
  ['/outreach', 'Outreach'],
  ['/worksheet', 'Worksheet'],
  ['/case-studies', 'Case Studies'],
]

const PATHWAY = [
  'Interest', 'Focused Field', 'Sources', 'Expert Thinking', 'Questions',
  'Toy Model', 'Data', 'Mentor Feedback', 'Revision', 'Output',
]

const HOME_GUIDES = [
  ['01', 'Choose a research direction', 'Move from a subject you enjoy to one observable phenomenon. A direction is useful when it is narrow enough to name what changes, what causes it, or what remains unexplained.', '/find-a-direction'],
  ['02', 'Find and verify sources', 'Begin with review articles and textbooks for vocabulary, then trace important claims back to original papers. Record the author, date, method, evidence, and limitations.', '/ai-literature'],
  ['03', 'Use AI responsibly', 'Use AI to generate search terms, clarify language, and compare ideas—not as a source of facts. Verify every claim and citation against the original publication.', '/ai-literature'],
  ['04', 'Notice expert thinking', 'Look across several papers for recurring choices: what experts measure, simplify, compare, model, test, and treat as uncertain.', '/ai-literature'],
  ['05', 'Turn confusion into questions', 'Keep a list of contradictions, unfamiliar concepts, surprising graphs, and unexplained assumptions. A precise gap can become a researchable question.', '/build-a-project'],
  ['06', 'Begin with a toy model', 'Build the smallest version that preserves the central mechanism. A toy model makes assumptions visible and gives you something concrete to test.', '/build-a-project'],
  ['07', 'Find public data', 'Search government repositories, university archives, open-data portals, and paper supplements. Check units, collection methods, and missing values.', '/build-a-project'],
  ['08', 'Contact professors', 'Write after doing enough work to ask a specific question. Show what you have read, what you have tried, and what focused advice would help.', '/outreach'],
  ['09', 'Learn from feedback', 'No reply or rejection is information, not a verdict. Improve the question, contact a better-matched person, and turn criticism into revision.', '/outreach'],
  ['10', 'Document an output', 'Create a paper, poster, notebook, model, data story, or tool that records your question, method, evidence, limitations, and next steps.', '/build-a-project'],
]

const FIELD_EXAMPLES = [
  ['Mathematics', 'Patterns → discrete mathematics → graph structure → network connectivity → Which local rules make a network resilient to node removal?'],
  ['Physics', 'Motion → fluid dynamics → vortices → wake formation → How does obstacle shape affect vortex shedding in a simple flow?'],
  ['Computer science', 'Machine learning → model evaluation → distribution shift → image classification → Which augmentations improve robustness when lighting changes?'],
  ['Biology', 'Ecology → plant interactions → pollination → urban gardens → How does plant diversity relate to pollinator visit frequency?'],
  ['Social science', 'Education → learning behavior → study strategies → retrieval practice → How does spaced self-testing affect retention over two weeks?'],
  ['Environmental science', 'Climate → cities → heat islands → tree cover → How strongly is neighborhood canopy associated with afternoon surface temperature?'],
]

const WORKSHEET_FIELDS = [
  ['interest', 'My area of interest', 'What topic keeps pulling your attention back?'],
  ['field', 'My narrower field', 'Name the discipline, subfield, or lens you want to explore.'],
  ['phenomenon', 'A concrete phenomenon I want to understand', 'Describe something observable, measurable, or puzzling.'],
  ['sources', 'Sources I found', 'Record titles, authors, links, and why each source matters.'],
  ['expertPatterns', 'What experts repeatedly do', 'What methods, comparisons, or assumptions recur?'],
  ['unknowns', 'Concepts I do not understand yet', 'List vocabulary, mathematics, tools, or mechanisms to learn.'],
  ['questions', 'Possible research questions', 'Write several specific questions before choosing one.'],
  ['toyModel', 'My smallest toy model', 'What simplified system could test the central idea?'],
  ['data', 'Public data I could use', 'Where is it hosted, and what does each variable mean?'],
  ['limitations', 'Assumptions and limitations', 'What are you simplifying, excluding, or unable to measure?'],
  ['mentors', 'Potential mentors', 'List people whose work closely matches your question.'],
  ['feedback', 'Feedback received', 'What changed in your thinking after critique or rejection?'],
  ['nextAction', 'My next concrete action', 'Choose one task you can complete in the next 30–60 minutes.'],
  ['output', 'Possible final output', 'Paper, poster, notebook, model, dataset, visualization, or tool?'],
]

function PageMeta({ title, description }) {
  return (
    <Helmet>
      <title>{title} | Research Starter Lab</title>
      <meta name="description" content={description} />
    </Helmet>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Research Starter Lab home">
          <span className="brand-mark" aria-hidden="true">RSL</span>
          <span><strong>Research Starter Lab</strong><small>Curiosity into careful inquiry</small></span>
        </Link>
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>
          <i /><i /><i /><span className="sr-only">Toggle navigation</span>
        </button>
        <nav id="primary-navigation" className={open ? 'primary-nav is-open' : 'primary-nav'}>
          {NAV_ITEMS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : undefined}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div><Link className="footer-brand" to="/">Research Starter Lab</Link><p>A practical pathway from curiosity to a real student research project.</p></div>
      <div className="footer-links">
        <Link to="/start-here">Begin the pathway</Link>
        <Link to="/worksheet">Open the worksheet</Link>
        <Link to="/case-studies">See a case study</Link>
      </div>
    </footer>
  )
}

function PageIntro({ eyebrow, title, description, children }) {
  return (
    <section className="page-intro"><div className="narrow">
      <p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{description}</p>{children}
    </div></section>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return <div className="section-heading">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
}

function ArrowSequence({ items, compact = false }) {
  return <ol className={`arrow-sequence${compact ? ' compact' : ''}`}>{items.map((item) => <li key={item}>{item}</li>)}</ol>
}

function HomePage() {
  return (
    <>
      <PageMeta title="Home" description="A practical pathway that helps high school students turn curiosity into a real research project." />
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Independent research, made navigable</p>
          <h1>Research<br />Starter Lab</h1>
          <p className="hero-subtitle">A practical pathway from curiosity to a real student research project.</p>
          <p className="hero-description">This site helps high school students move from an area of interest to literature, questions, models, data, mentorship, revision, and a meaningful final output.</p>
          <div className="button-row">
            <Link className="button primary" to="/start-here">Start the Pathway</Link>
            <Link className="button secondary" to="/worksheet">Open the Worksheet</Link>
            <Link className="text-link" to="/case-studies">View Case Studies <span>→</span></Link>
          </div>
        </div>
        <aside className="hero-note">
          <p className="note-label">A field note</p>
          <blockquote>Research does not begin when you already know the answer. It begins when you can describe what you do not understand—and take one careful step toward finding out.</blockquote>
          <div className="note-rule" /><p>Observe closely. Keep records. Revise often.</p>
        </aside>
      </section>
      <section className="pathway-section">
        <SectionHeading eyebrow="The pathway" title="Ten stages, revisited as often as needed" description="Use this as a map, not a rigid timeline. Strong projects move backward and forward whenever evidence changes the question." />
        <ArrowSequence items={PATHWAY} />
      </section>
      <section className="guide-section">
        <SectionHeading eyebrow="Field guide" title="What the work actually involves" description="Each stage produces a small, visible artifact: a source note, a question draft, a model, a graph, an email, or a revision." />
        <div className="guide-grid">
          {HOME_GUIDES.map(([number, title, text, to]) => (
            <article className="guide-card" key={number}><span className="card-number">{number}</span><h3>{title}</h3><p>{text}</p><Link to={to}>Explore this stage <span>→</span></Link></article>
          ))}
        </div>
      </section>
      <section className="closing-panel">
        <p className="eyebrow">Start with evidence of thought</p><h2>Your first research result can be one page.</h2>
        <p>Record an interest, three credible sources, one persistent confusion, and the smallest next action.</p>
        <Link className="button light" to="/worksheet">Create your first research record</Link>
      </section>
    </>
  )
}

function StartHerePage() {
  const checklist = [
    ['Choose one area', 'Write down a subject you return to voluntarily—not the subject you think sounds most impressive.'],
    ['Collect five search terms', 'Include a broad field, a specific phenomenon, a method, a dataset, and one unfamiliar technical term.'],
    ['Find three credible sources', 'Choose one overview, one original study, and one recent paper that cites earlier work.'],
    ['Keep a confusion list', 'Record terms, graphs, assumptions, and conclusions you cannot yet explain in your own words.'],
    ['Write three questions', 'Make each question narrow enough to suggest evidence that could change your mind.'],
    ['Choose one next action', 'Read one section, reproduce one figure, inspect one dataset, or draft one short model.'],
  ]
  return (
    <>
      <PageMeta title="Start Here" description="Understand the student research journey and complete a concrete first-day checklist." />
      <PageIntro eyebrow="Orientation" title="Start here" description="A research project is a chain of increasingly precise decisions. You do not need a perfect topic on day one; you need a record of what interests you and a method for narrowing it." />
      <main className="page-content">
        <section><SectionHeading eyebrow="The whole journey" title="From interest to an inspectable result" description="Every stage should leave evidence of your thinking. That record helps you notice progress, explain your work to mentors, and recover when an approach fails." /><ArrowSequence items={PATHWAY} compact /></section>
        <section className="split-section">
          <div><p className="eyebrow">A better expectation</p><h2>Uncertainty is part of the method</h2></div>
          <div className="prose"><p>Early research often feels inefficient because reading creates more questions. That is useful. New vocabulary lets you search more precisely; failed models expose hidden assumptions; feedback reveals what an expert needs to trust your result.</p><p>Your goal is not to avoid uncertainty. Your goal is to make uncertainty specific enough to study. Keep dated notes, preserve failed attempts, and write down why you changed direction.</p></div>
        </section>
        <section><SectionHeading eyebrow="Day one" title="A concrete first-day checklist" /><ol className="checklist">
          {checklist.map(([title, text], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
        </ol></section>
        <aside className="callout"><div><p className="eyebrow">Before you stop</p><h2>Make tomorrow obvious.</h2></div><p>End each session by writing one action that begins with a verb and can be completed in under an hour.</p><Link className="button primary" to="/worksheet">Record it in the worksheet</Link></aside>
      </main>
    </>
  )
}

function FindDirectionPage() {
  return (
    <>
      <PageMeta title="Find a Direction" description="Narrow an interest into a concrete, researchable problem across many fields." />
      <PageIntro eyebrow="Stage one" title="Find a direction" description="Good research topics are not found fully formed. They are narrowed through reading, comparison, and contact with concrete phenomena." />
      <main className="page-content">
        <section><SectionHeading eyebrow="The narrowing ladder" title="Move from a noun to a question" description="At each step, replace a broad label with something more observable and specific." /><ArrowSequence items={['Interest', 'Broad Field', 'Subfield', 'Concrete Phenomenon', 'Specific Researchable Problem']} /></section>
        <section className="split-section">
          <div><p className="eyebrow">Test your direction</p><h2>A useful problem has boundaries</h2></div>
          <div className="question-list"><p>Can I name the system, population, object, or process?</p><p>Can I identify a variable, relationship, pattern, or mechanism?</p><p>Can I find evidence that is available to a student?</p><p>Can I build a smaller version before attempting the full problem?</p><p>Can I explain what result would surprise me?</p></div>
        </section>
        <section><SectionHeading eyebrow="Across disciplines" title="Examples of progressive narrowing" description="The final question will still change after reading. Its job is to guide the next search, not to remain permanent." />
          <div className="example-grid">{FIELD_EXAMPLES.map(([field, path]) => <article className="example-card" key={field}><p>{field}</p><h3>{path}</h3></article>)}</div>
        </section>
        <section className="two-column-cards">
          <article><p className="eyebrow">Too broad</p><h2>“I want to study climate change.”</h2><p>This names an important area but not a system, scale, variable, mechanism, or feasible source of evidence.</p></article>
          <article className="accent-card"><p className="eyebrow">Researchable direction</p><h2>“How does tree cover relate to summer surface temperature across neighborhoods in my city?”</h2><p>This version suggests variables, public geospatial data, a scale of analysis, limitations, and possible mentors.</p></article>
        </section>
      </main>
    </>
  )
}

function WorkflowPage() {
  const cycle = ['Question', 'Source', 'Model', 'Test', 'Failure', 'Revision', 'New Question']
  return (
    <>
      <PageMeta title="Research Workflow" description="Learn an iterative research workflow built around tests, failures, revisions, and new questions." />
      <PageIntro eyebrow="How research moves" title="Research is iterative" description="A project rarely travels in one direction. Each source, test, and failure can change the question—and that change is progress when you document why it happened." />
      <main className="page-content">
        <section className="cycle-section">
          <div className="cycle-copy"><p className="eyebrow">The working loop</p><h2>Return with better information</h2><p>A loop is not repetition if each pass sharpens an assumption, method, measurement, or question.</p></div>
          <ol className="cycle">{cycle.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol>
        </section>
        <section><SectionHeading eyebrow="When something fails" title="Treat failure as a diagnostic" /><div className="three-column">
          <article><h3>Model failure</h3><p>Ask which assumption is doing too much work. Remove complexity, check units, and test a case where the answer is known.</p></article>
          <article><h3>Data failure</h3><p>Inspect collection methods, missing values, definitions, and scale. A dataset may answer a nearby question better than your original one.</p></article>
          <article><h3>Question failure</h3><p>If evidence cannot distinguish possible answers, revise the question so that a result could genuinely change your conclusion.</p></article>
        </div></section>
        <section className="split-section">
          <div><p className="eyebrow">Research log</p><h2>Record decisions, not only results</h2></div>
          <div className="prose"><p>For every substantial change, record the date, what you expected, what happened, and what you changed next.</p><ul><li>The source or observation that prompted the change</li><li>The assumption, method, or question you revised</li><li>The evidence that would support or challenge the new direction</li><li>The smallest next test</li></ul></div>
        </section>
        <aside className="callout"><div><p className="eyebrow">Useful habit</p><h2>Version your thinking.</h2></div><p>Keep question v1, v2, and v3. The differences show how evidence improved your project.</p><Link className="button primary" to="/worksheet">Update your research record</Link></aside>
      </main>
    </>
  )
}

function AiLiteraturePage() {
  const method = [
    ['Orient', 'Use a textbook chapter, review article, or university guide to learn the field’s vocabulary.'],
    ['Trace', 'Follow important claims to the original paper instead of relying on a summary or search snippet.'],
    ['Map', 'Group sources by question, method, dataset, finding, disagreement, and citation relationship.'],
    ['Verify', 'Open every AI-suggested reference. Confirm that the title, authors, venue, year, and claimed result are real.'],
    ['Extract', 'Note the methods experts repeatedly use and the reasons they give for choosing them.'],
    ['Question', 'Collect limitations, conflicting results, untested assumptions, and recommendations for future work.'],
  ]
  return (
    <>
      <PageMeta title="AI & Literature" description="Search, map, verify, and cite research literature while using AI responsibly." />
      <PageIntro eyebrow="Sources and tools" title="AI & literature" description="Literature review is not a pile of summaries. It is a map of how experts define a problem, produce evidence, disagree, and identify what remains unknown." />
      <main className="page-content">
        <section><SectionHeading eyebrow="A reliable method" title="Search outward, verify inward" /><ol className="method-list">{method.map(([title, text], index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
        <section className="two-column-cards">
          <article><p className="eyebrow">Primary sources</p><h2>Evidence from the original work</h2><p>Research papers, datasets, technical reports, field observations, interviews, experiments, and source documents present original evidence or analysis.</p></article>
          <article><p className="eyebrow">Secondary sources</p><h2>Interpretation and orientation</h2><p>Reviews, textbooks, news articles, videos, and explainers help you learn context. Use them to navigate, then verify key claims at their source.</p></article>
        </section>
        <section className="split-section">
          <div><p className="eyebrow">Literature map</p><h2>Give every source a role</h2></div>
          <div className="prose"><p>Save the full citation when you first open a source. For each item, record:</p><ul><li>The problem and why it matters</li><li>The data, model, experiment, or argument used</li><li>The main result and supporting evidence</li><li>Assumptions, limitations, and unanswered questions</li><li>Which earlier work it builds on and which later work cites it</li></ul></div>
        </section>
        <section><SectionHeading eyebrow="AI verification protocol" title="Never cite what you have not opened" /><div className="warning-panel">
          <div><h3>Use AI for</h3><ul><li>Generating search vocabulary</li><li>Explaining unfamiliar terms</li><li>Comparing your own source notes</li><li>Suggesting counterarguments to test</li></ul></div>
          <div><h3>Do not use AI as</h3><ul><li>A bibliographic database</li><li>Proof that a claim is true</li><li>A substitute for reading methods</li><li>An author whose words you present as your own</li></ul></div>
          <div><h3>Before saving a claim</h3><ul><li>Open the publication</li><li>Match the claim to the relevant passage</li><li>Check context and limitations</li><li>Save the real citation and link</li></ul></div>
        </div></section>
      </main>
    </>
  )
}

function BuildProjectPage() {
  const blocks = [
    ['Research question', 'Name the system, relationship, or mechanism; define the scope; and state what evidence could change your answer.'],
    ['Assumptions', 'List what you treat as fixed, negligible, measurable, or representative. Assumptions are design choices, not details to hide.'],
    ['Toy model', 'Preserve one central mechanism in the smallest system you can calculate, simulate, observe, or test.'],
    ['Public data', 'Read documentation, inspect units and provenance, visualize raw values, and check missing or biased observations.'],
    ['Basic analysis', 'Begin with distributions, examples, baselines, simple comparisons, and plots before using complicated methods.'],
    ['Validation', 'Test a known case, compare with published results, hold out data, vary assumptions, or ask whether another method agrees.'],
    ['Limitations', 'State where your conclusion stops: sample, scale, uncertainty, model simplification, measurement, or alternatives.'],
    ['Iteration', 'Use unexpected results to revise one element at a time so you can tell which change mattered.'],
    ['Final deliverable', 'Choose a format that makes the question, method, evidence, limitations, and reproducible materials inspectable.'],
  ]
  return (
    <>
      <PageMeta title="Build a Project" description="Formulate a question, build a toy model, analyze public data, validate results, and produce a final deliverable." />
      <PageIntro eyebrow="From reading to making" title="Build a project" description="A strong student project is not defined by scale. It is defined by a clear question, transparent assumptions, evidence you can inspect, and revisions you can explain." />
      <main className="page-content">
        <section><SectionHeading eyebrow="Project anatomy" title="Nine parts of an inspectable project" /><div className="build-grid">{blocks.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section className="split-section">
          <div><p className="eyebrow">Start smaller</p><h2>Your toy model should feel almost too simple</h2></div>
          <div className="prose"><p>Use one variable before ten, synthetic data before a difficult archive, a small sample before a full population, or a known limiting case before an open problem.</p><p>The purpose is not realism. It is to discover whether your logic, code, measurement, and expected behavior make sense.</p></div>
        </section>
        <section><SectionHeading eyebrow="Public data checklist" title="Understand the dataset before interpreting it" /><div className="question-list horizontal"><p>Who collected it, and for what original purpose?</p><p>What does one row represent?</p><p>What are the units and definitions?</p><p>What is missing or filtered out?</p><p>What bias could collection introduce?</p><p>What license, citation, or privacy rules apply?</p></div></section>
        <aside className="callout"><div><p className="eyebrow">Possible outputs</p><h2>Match the format to the evidence.</h2></div><p>Research paper · poster · computational notebook · annotated dataset · physical model · visualization · open-source tool</p><Link className="button primary" to="/worksheet">Plan your project</Link></aside>
      </main>
    </>
  )
}

function OutreachPage() {
  return (
    <>
      <PageMeta title="Outreach" description="Identify suitable mentors, write specific emails, follow up professionally, and use feedback well." />
      <PageIntro eyebrow="Mentorship" title="Outreach" description="A useful mentor is not necessarily the most famous person in a broad field. Look for someone whose recent work closely overlaps your specific question, method, or dataset." />
      <main className="page-content">
        <section className="three-column">
          <article><span className="card-number">01</span><h3>Identify a match</h3><p>Read the lab page and at least one recent publication. Confirm that the person still works on the topic you plan to mention.</p></article>
          <article><span className="card-number">02</span><h3>Prepare evidence</h3><p>Have a short question, a source note, and a small attempt to share. Preparation makes focused advice easier.</p></article>
          <article><span className="card-number">03</span><h3>Make a small ask</h3><p>Ask one answerable question or request a brief conversation. Do not ask a stranger to design or supervise your entire project.</p></article>
        </section>
        <section className="email-section">
          <div><p className="eyebrow">A concise structure</p><h2>Write a short, specific email</h2><p>Personalize every message. Six thoughtful emails to well-matched people are more useful than sixty generic emails.</p></div>
          <div className="email-card"><p className="email-subject">Subject: Student question about [specific topic]</p><p>Dear Professor [Name],</p><p>I am a high school student studying [specific problem]. I read your work on [paper or method], especially [specific detail].</p><p>I have tried [small model, analysis, or reading] and am currently unsure about [focused question]. Would you be willing to offer a brief suggestion or point me toward a useful source?</p><p>I have included a one-page summary for context. Thank you for considering my question.</p><p>Best,<br />[Your name]</p></div>
        </section>
        <section className="two-column-cards">
          <article><p className="eyebrow">Follow-up</p><h2>One reminder is appropriate</h2><p>Wait about one week, reply in the same email thread, and keep the follow-up to two or three sentences. If there is still no response, move on.</p></article>
          <article><p className="eyebrow">No reply or rejection</p><h2>Revise the match, not your worth</h2><p>Faculty receive more requests than they can answer. Recheck whether your question fits their work, improve your evidence of preparation, and contact another suitable person.</p></article>
        </section>
        <section className="split-section">
          <div><p className="eyebrow">After feedback</p><h2>Close the loop</h2></div>
          <div className="prose"><ol><li>Write the feedback in your own words.</li><li>Separate required corrections from optional directions.</li><li>Choose one revision or test that responds directly.</li><li>Send a brief thank-you; later, share a concise update if the advice materially helped.</li></ol></div>
        </section>
      </main>
    </>
  )
}

function WorksheetPage() {
  const emptyForm = Object.fromEntries(WORKSHEET_FIELDS.map(([key]) => [key, '']))
  const [form, setForm] = useState(() => {
    try { return { ...emptyForm, ...JSON.parse(localStorage.getItem('research-starter-worksheet') || '{}') } }
    catch { return emptyForm }
  })
  const [saved, setSaved] = useState(false)
  const save = () => {
    localStorage.setItem('research-starter-worksheet', JSON.stringify(form))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }
  const clear = () => {
    if (window.confirm('Clear every response in this worksheet?')) {
      setForm(emptyForm)
      localStorage.removeItem('research-starter-worksheet')
    }
  }
  return (
    <>
      <PageMeta title="Worksheet" description="An interactive and printable worksheet for planning and documenting a student research project." />
      <PageIntro eyebrow="Working document" title="Student research worksheet" description="Use this page as a living research record. Your answers can remain incomplete, change over time, and become more precise as you learn.">
        <div className="worksheet-actions"><button className="button primary" type="button" onClick={save}>{saved ? 'Saved locally' : 'Save progress'}</button><button className="button secondary" type="button" onClick={() => window.print()}>Print worksheet</button><button className="text-button" type="button" onClick={clear}>Clear responses</button></div>
      </PageIntro>
      <main className="worksheet-content">
        <div className="privacy-note">Your entries stay in this browser. They are not sent to a server.</div>
        <form className="worksheet-form" onSubmit={(event) => event.preventDefault()}>
          {WORKSHEET_FIELDS.map(([key, label, prompt], index) => (
            <label className="worksheet-field" key={key}><span className="field-number">{String(index + 1).padStart(2, '0')}</span><span className="field-copy"><strong>{label}</strong><small>{prompt}</small></span><textarea rows="5" value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} placeholder="Write here…" /></label>
          ))}
        </form>
        <div className="worksheet-bottom-actions"><button className="button primary" type="button" onClick={save}>{saved ? 'Saved locally' : 'Save progress'}</button><button className="button secondary" type="button" onClick={() => window.print()}>Print worksheet</button></div>
      </main>
    </>
  )
}

function CaseStudiesPage() {
  return (
    <>
      <PageMeta title="Case Studies" description="See how a student interest can develop into an evidence-based research project." />
      <PageIntro eyebrow="Research in practice" title="Case studies" description="A finished project can make the pathway look inevitable. A useful case study shows the narrower questions, technical choices, revisions, and outputs that connected the beginning to the result." />
      <main className="page-content case-page">
        <article className="case-card">
          <div className="case-index"><span>Case study</span><strong>01</strong></div>
          <div className="case-copy">
            <p className="eyebrow">Astronomy · Physics · Applied mathematics</p>
            <h2>Saturn Rings Reconstruction Lab</h2>
            <p>A case study showing how an interest in astronomy, physics, and applied mathematics developed into a project involving Cassini radio-occultation data, inverse problems, numerical diagnostics, and interactive tools.</p>
            <a className="button primary" href="https://primes-ring-website-p9yv.vercel.app/" target="_blank" rel="noopener noreferrer">Visit the external project <span aria-hidden="true">↗</span></a>
          </div>
        </article>
        <section className="case-reading"><SectionHeading eyebrow="How to read a case study" title="Look for decisions you can transfer" /><div className="three-column">
          <article><h3>What narrowed?</h3><p>Notice how a broad interest became a field, a phenomenon, and then a problem that could be modeled or tested.</p></article>
          <article><h3>What changed?</h3><p>Look for assumptions, failed approaches, mentor feedback, and technical constraints that forced revision.</p></article>
          <article><h3>What became visible?</h3><p>Identify the final artifacts that let another person inspect the question, method, evidence, and limitations.</p></article>
        </div></section>
      </main>
    </>
  )
}

function NotFoundPage() {
  return <main className="not-found"><p className="eyebrow">404</p><h1>This page is not in the research notebook.</h1><p>Return home or begin with the student pathway.</p><div className="button-row"><Link className="button primary" to="/">Return home</Link><Link className="button secondary" to="/start-here">Start here</Link></div></main>
}

export default function App() {
  return (
    <div className="site-shell"><Header /><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start-here" element={<StartHerePage />} />
      <Route path="/find-a-direction" element={<FindDirectionPage />} />
      <Route path="/research-workflow" element={<WorkflowPage />} />
      <Route path="/ai-literature" element={<AiLiteraturePage />} />
      <Route path="/build-a-project" element={<BuildProjectPage />} />
      <Route path="/outreach" element={<OutreachPage />} />
      <Route path="/worksheet" element={<WorksheetPage />} />
      <Route path="/case-studies" element={<CaseStudiesPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes><Footer /></div>
  )
}

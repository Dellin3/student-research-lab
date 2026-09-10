import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'
const MESSAGES = {
  teacher: { greeting: 'Hi [Teacher’s name],', subject: 'Could I ask your advice about a small research project?', body: ['I’m interested in [topic] and would like to explore [small question]. I have started by [what you read or tried].', 'Could you suggest a useful next step or someone at school I could talk to? I would appreciate a few minutes of feedback when you have time.'] },
  researcher: { greeting: 'Dear [Title and name],', subject: 'Student question about [specific research topic]', body: ['I’m a high-school student interested in [specific question]. I read about your work on [paper or project], especially [one detail you understood].', 'I have tried [a small analysis, calculation, or reading] and am unsure about [focused question]. Would you be willing to suggest a useful starting point or source?'] },
}
export default function OutreachPage() {
  const [audience, setAudience] = useState('teacher')
  const [copied, setCopied] = useState('')
  const message = MESSAGES[audience]
  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${message.subject}\n\n${message.greeting}\n\n${message.body.join('\n\n')}\n\nThank you,\n[Your name]`)
      setCopied('Copied. Replace the brackets with your own details before sending.')
    } catch { setCopied('Select the example text and copy it manually.') }
  }
  return <>
    <RouteSeo path="/outreach" />
    <PageIntro eyebrow="Finding guidance" title="Start a useful conversation." description="You do not need a finished project to ask for advice. A specific interest and a small question are enough to start." />
    <main id="main-content" className="page-content">
      <section className="three-column"><h2 className="sr-only">Before you reach out</h2>
        <article><span className="card-number">01</span><h3>Choose a relevant person</h3><p>Start with a subject teacher. For a researcher, read their profile and check whether their interests match yours.</p></article>
        <article><span className="card-number">02</span><h3>Show your starting point</h3><p>Share one question and a little of what you have read or tried. It is fine to say what you do not understand.</p></article>
        <article><span className="card-number">03</span><h3>Make a small request</h3><p>Ask for a suggestion, a useful source, or brief feedback. Keep the first message short and personal.</p></article>
      </section>
      <section className="email-section"><div><p className="eyebrow">Make it your own</p><h2>A first message.</h2><p>Choose who you’re writing to. Replace the brackets with honest, specific details.</p><div className="field-switch" role="group" aria-label="Message recipient"><button type="button" aria-pressed={audience === 'teacher'} onClick={() => {setAudience('teacher'); setCopied('')}}>A school teacher</button><button type="button" aria-pressed={audience === 'researcher'} onClick={() => {setAudience('researcher'); setCopied('')}}>A researcher</button></div><button type="button" className="inline-action" onClick={copy}>Copy this example <span aria-hidden="true">↗</span></button><p className="copy-status" role="status">{copied}</p></div>
        <div className="email-card" key={audience}><p className="email-subject">Subject: {message.subject}</p><p>{message.greeting}</p>{message.body.map(text => <p key={text}>{text}</p>)}<p>Thank you,<br />[Your name]</p></div>
      </section>
      <p className="hub-footnote">No reply? One polite follow-up after a week or two is enough. Move on if they are unavailable.</p>
      <div className="button-row"><Link className="button primary" to="/resources?view=mentors">Find people to ask ↗</Link><Link className="inline-action" to="/worksheet#mentor-brief">Prepare a one-page summary →</Link></div>
    </main>
  </>
}

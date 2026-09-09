import { Link } from 'react-router-dom'
import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'

export default function OutreachPage() {
  return (
    <>
      <RouteSeo path="/outreach" />
      <PageIntro eyebrow="Research feedback" title="Ask a focused question." description="Show a relevant mentor what you have tried and where you need help." />
      <main id="main-content" className="page-content">
        <section className="three-column">
          <h2 className="sr-only">Preparing for mentor outreach</h2>
          <article><span className="card-number">01</span><h3>Identify a match</h3><p>Read the lab page and one recent publication. Confirm that the person still works on the topic you mention.</p></article>
          <article><span className="card-number">02</span><h3>Prepare evidence</h3><p>Have a short question, a source note, and a small attempt to share. Preparation makes focused advice easier.</p></article>
          <article><span className="card-number">03</span><h3>Make a small ask</h3><p>Ask one answerable question or request a brief conversation, not supervision of an entire project.</p></article>
        </section>
        <section className="email-section">
          <div><p className="eyebrow">A concise structure</p><h2>Write a short, specific email</h2><p>Personalize every message. A few thoughtful emails to well-matched people are more useful than many generic emails.</p></div>
          <div className="email-card"><p className="email-subject">Subject: Student question about [specific topic]</p><p>Dear Professor [Name],</p><p>I am a high school student studying [specific problem]. I read your work on [paper or method], especially [specific detail].</p><p>I have tried [small model, analysis, or reading] and am unsure about [focused question]. Would you be willing to offer a brief suggestion or point me toward a useful source?</p><p>I have included a one-page summary for context. Thank you for considering my question.</p><p>Best,<br />[Your name]</p></div>
        </section>
        <p className="hub-footnote">If there is no reply, a brief follow-up after about a week is reasonable. When feedback arrives, record what changed and why.</p>
        <Link className="button primary" to="/worksheet#mentor-brief">Prepare a mentor brief ↗</Link>
      </main>
    </>
  )
}

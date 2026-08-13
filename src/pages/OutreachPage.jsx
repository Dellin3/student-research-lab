import PageIntro from '../components/layout/PageIntro.jsx'
import RouteSeo from '../components/layout/RouteSeo.jsx'

export default function OutreachPage() {
  return (
    <>
      <RouteSeo path="/outreach" />
      <PageIntro eyebrow="Mentorship" title="Outreach" description="Look for someone whose recent work overlaps your specific question, method, or dataset—not simply the most famous person in a broad field." />
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
        <section className="two-column-cards">
          <article><p className="eyebrow">Follow-up</p><h2>One reminder is appropriate</h2><p>Wait about one week, reply in the same thread, and keep it to two or three sentences. Then move on.</p></article>
          <article><p className="eyebrow">No reply or rejection</p><h2>Revise the match, not your worth</h2><p>Recheck the fit, improve your evidence of preparation, and contact another suitable person.</p></article>
        </section>
        <section className="split-section">
          <div><p className="eyebrow">After feedback</p><h2>Close the loop</h2></div>
          <div className="prose"><ol><li>Restate the feedback in your own words.</li><li>Separate corrections from optional directions.</li><li>Choose one revision or test.</li><li>Send thanks and, if useful, a later concise update.</li></ol></div>
        </section>
      </main>
    </>
  )
}

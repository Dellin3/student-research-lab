const outputs = [
  'A focused question someone else can understand',
  'Evidence another person can inspect',
  'A visible trail of assumptions and revisions',
  'A clear next action or honest stopping point',
]

const principles = [
  'Verify sources and trace important claims.',
  'Separate evidence from interpretation.',
  'State uncertainty without pretending it is certainty.',
  'Use AI for support; let evidence decide.',
]

export default function PrinciplesStrip() {
  return (
    <section className="outputs-principles" aria-labelledby="outputs-principles-title">
      <div className="home-shell outputs-principles-layout">
        <div>
          <p className="home-kicker">Strong research leaves a trace</p>
          <h2 id="outputs-principles-title">Useful outputs</h2>
          <ul>{outputs.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div>
          <p className="home-kicker">While you work</p>
          <h2>Working principles</h2>
          <ul>{principles.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
    </section>
  )
}

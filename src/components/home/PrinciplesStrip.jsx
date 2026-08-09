const principles = [
  'Free to use',
  'No account required',
  'Work stays in your browser where applicable',
  'Verify every source',
  'AI suggests; evidence decides',
]

export default function PrinciplesStrip() {
  return (
    <section className="principles-strip" aria-label="Research Starter Lab principles">
      <ul>
        {principles.map((principle) => (
          <li key={principle}><span aria-hidden="true">◆</span>{principle}</li>
        ))}
      </ul>
    </section>
  )
}

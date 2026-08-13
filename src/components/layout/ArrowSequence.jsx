export default function ArrowSequence({ items, compact = false }) {
  return (
    <ol className={`arrow-sequence${compact ? ' compact' : ''}`}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ol>
  )
}

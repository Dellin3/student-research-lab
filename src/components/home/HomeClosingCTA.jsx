import { Link } from 'react-router-dom'

export default function HomeClosingCTA() {
  return (
    <section className="home-closing" aria-labelledby="home-closing-title">
      <div className="home-shell">
        <p className="home-kicker">Begin before it is polished</p>
        <h2 id="home-closing-title">Research starts before you feel ready.</h2>
        <p>One honest interest is enough for the next small move.</p>
        <Link className="button primary" to="/find-a-direction">Start with one interest</Link>
      </div>
    </section>
  )
}

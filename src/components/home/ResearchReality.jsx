const steps = [
  ['Interest', 48, 55],
  ['reading', 170, 105],
  ['confusion', 310, 58],
  ['question', 430, 120],
  ['failed test', 350, 220],
  ['new source', 190, 185],
  ['revised question', 78, 265],
  ['small result', 230, 320],
  ['feedback', 405, 278],
  ['revision', 475, 370],
  ['output', 292, 410],
]

export default function ResearchReality() {
  return (
    <section className="research-reality-section" aria-labelledby="research-reality-title">
      <div className="home-shell">
        <div className="section-heading">
          <p className="home-kicker">The honest version</p>
          <h2 id="research-reality-title">Research is not a straight line.</h2>
        </div>
        <div className="reality-comparison">
          <article className="clean-version">
            <p className="home-meta">The presentation version</p>
            <div className="clean-sequence" aria-label="Interest, question, method, result">
              <span>Interest</span><i>→</i><span>Question</span><i>→</i><span>Method</span><i>→</i><span>Result</span>
            </div>
            <p>Useful for explaining finished work. Rarely true while the work is happening.</p>
          </article>

          <figure className="messy-version">
            <p className="home-meta">The working version</p>
            <svg viewBox="0 0 540 455" role="img" aria-labelledby="messy-title messy-desc">
              <title id="messy-title">An iterative research path</title>
              <desc id="messy-desc">
                A looping path through reading, confusion, failed tests, new
                sources, feedback, revision, and output.
              </desc>
              <path
                className="messy-path"
                d="M48 55C95 45 122 100 170 105S270 88 310 58C360 22 420 60 430 120C440 180 395 215 350 220S230 155 190 185C138 225 105 226 78 265C42 317 155 330 230 320S355 250 405 278C465 312 433 345 475 370C505 390 402 432 292 410"
              />
              <path className="messy-return" d="M475 370C430 328 395 280 350 220" />
              <path className="messy-arrow" d="M350 220l20 3-9 16" />
              {steps.map(([label, x, y], index) => (
                <g className="messy-node" transform={`translate(${x} ${y})`} key={label}>
                  <circle r={index === 0 || index === steps.length - 1 ? 8 : 6} />
                  <text y="-14" textAnchor="middle">{label}</text>
                </g>
              ))}
            </svg>
            <figcaption>Wrong turns become useful when you record what changed and why.</figcaption>
          </figure>
        </div>
        <p className="reality-thesis">
          Good research is not the absence of wrong turns. It is the ability to
          make those turns visible, testable, and useful.
        </p>
      </div>
    </section>
  )
}

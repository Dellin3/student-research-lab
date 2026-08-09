import { logicNodeStates } from '../../utils/questionGenerator.js'

function nodeClass(active, incomplete = false) {
  if (incomplete) return 'qb-logic-node is-incomplete'
  if (active) return 'qb-logic-node is-active'
  return 'qb-logic-node'
}

export default function LogicDiagram({ state }) {
  const nodes = logicNodeStates(state)
  const evidenceIncomplete = nodes.evidencePartial && !nodes.evidence
  const contextIncomplete = !nodes.context && (nodes.phenomenon || nodes.factor)
  const questionResolved = nodes.question

  return (
    <figure className="qb-logic" aria-label="Live research logic diagram">
      <figcaption className="qb-logic-caption">Live research logic</figcaption>
      <svg className="qb-logic-svg" viewBox="0 0 280 340" role="img" aria-hidden="true">
        <defs>
          <marker id="qb-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
          </marker>
        </defs>

        <g className={nodeClass(nodes.interest)}>
          <rect x="70" y="8" width="140" height="28" rx="2" />
          <text x="140" y="26" textAnchor="middle">Interest</text>
        </g>
        <path className={`qb-logic-edge${nodes.phenomenon ? ' is-active' : ''}`} d="M140 36v18" markerEnd="url(#qb-arrow)" />

        <g className={nodeClass(nodes.phenomenon)}>
          <rect x="70" y="54" width="140" height="28" rx="2" />
          <text x="140" y="72" textAnchor="middle">Phenomenon</text>
        </g>
        <path className={`qb-logic-edge${nodes.factor || nodes.outcome ? ' is-active' : ''}`} d="M140 82v18" markerEnd="url(#qb-arrow)" />

        <g className={nodeClass(nodes.factor)}>
          <rect x="18" y="100" width="100" height="28" rx="2" />
          <text x="68" y="118" textAnchor="middle">Factor</text>
        </g>
        <path className={`qb-logic-edge${nodes.factor && nodes.outcome ? ' is-active' : ''}`} d="M118 114h44" markerEnd="url(#qb-arrow)" />
        <g className={nodeClass(nodes.outcome)}>
          <rect x="162" y="100" width="100" height="28" rx="2" />
          <text x="212" y="118" textAnchor="middle">Outcome</text>
        </g>
        <path className={`qb-logic-edge${nodes.context ? ' is-active' : ''}`} d="M140 128v18" markerEnd="url(#qb-arrow)" />

        <g className={nodeClass(nodes.context, contextIncomplete)}>
          <rect x="70" y="146" width="140" height="28" rx="2" />
          <text x="140" y="164" textAnchor="middle">Context</text>
        </g>
        <path className={`qb-logic-edge${nodes.evidence || nodes.evidencePartial ? ' is-active' : ''}`} d="M140 174v18" markerEnd="url(#qb-arrow)" />

        <g className={nodeClass(nodes.evidence, evidenceIncomplete || (!nodes.evidence && nodes.context))}>
          <rect x="70" y="192" width="140" height="28" rx="2" />
          <text x="140" y="210" textAnchor="middle">Evidence</text>
        </g>
        <path className={`qb-logic-edge${questionResolved ? ' is-active' : ''}`} d="M140 220v18" markerEnd="url(#qb-arrow)" />

        <g className={`qb-logic-node qb-logic-question${questionResolved ? ' is-resolved' : nodes.phenomenon ? ' is-active' : ''}`}>
          <rect x="55" y="238" width="170" height="36" rx="2" />
          <text x="140" y="260" textAnchor="middle">Question</text>
        </g>
      </svg>
      <ul className="qb-logic-legend">
        <li><span className="qb-swatch is-active" /> Defined</li>
        <li><span className="qb-swatch is-incomplete" /> Incomplete</li>
        <li><span className="qb-swatch" /> Waiting</li>
      </ul>
    </figure>
  )
}

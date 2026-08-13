import { logicNodeStates } from '../../utils/questionGenerator.js'

function nodeState(defined, partial = false) {
  if (defined) return 'defined'
  if (partial) return 'partial'
  return 'waiting'
}

function nodeClass(state) {
  return `qb-logic-node is-${state}`
}

export default function LogicDiagram({ state }) {
  const nodes = logicNodeStates(state)
  const mathematical = state.field === 'Mathematics'
    || state.relationType === 'mathematical-structure'
  const evidenceIncomplete = nodes.evidencePartial && !nodes.evidence
  const contextIncomplete = !nodes.context && (nodes.phenomenon || nodes.factor)
  const questionResolved = nodes.question
  const states = mathematical
    ? {
        Interest: nodeState(nodes.interest),
        'Object / structure': nodeState(nodes.phenomenon, nodes.interest),
        'Assumptions / conditions': nodeState(nodes.context && nodes.factor, nodes.context || nodes.factor),
        'Quantity / claim': nodeState(nodes.outcome, nodes.phenomenon),
        'Proof / computation / counterexample': nodeState(nodes.evidence, evidenceIncomplete || nodes.context),
        Question: nodeState(questionResolved, nodes.phenomenon),
      }
    : {
        Interest: nodeState(nodes.interest),
        Phenomenon: nodeState(nodes.phenomenon, nodes.interest),
        'Factor / relation': nodeState(nodes.factor, nodes.phenomenon),
        'Outcome / target': nodeState(nodes.outcome, nodes.phenomenon),
        Context: nodeState(nodes.context, contextIncomplete),
        Evidence: nodeState(nodes.evidence, evidenceIncomplete || (!nodes.evidence && nodes.context)),
        Question: nodeState(questionResolved, nodes.phenomenon),
      }

  return (
    <figure className="qb-logic" aria-label="Live research logic diagram">
      <figcaption className="qb-logic-caption">Live research logic · structural state only</figcaption>
      <svg className="qb-logic-svg" viewBox="0 0 280 340" role="img" aria-hidden="true">
        <defs>
          <marker id="qb-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
          </marker>
        </defs>

        {Object.entries(states).map(([label, status], index) => {
          const y = 8 + index * 46
          const isQuestion = label === 'Question'
          return (
            <g key={label}>
              {index > 0 && (
                <path
                  className={`qb-logic-edge${status !== 'waiting' ? ' is-active' : ''}`}
                  d={`M140 ${y - 18}v18`}
                  markerEnd="url(#qb-arrow)"
                />
              )}
              <g className={`${nodeClass(status)}${isQuestion ? ` qb-logic-question${questionResolved ? ' is-resolved' : ''}` : ''}`}>
                <rect x="30" y={y} width="220" height={isQuestion ? 36 : 30} rx="2" />
                <text x="140" y={y + (isQuestion ? 23 : 20)} textAnchor="middle">{label}</text>
              </g>
            </g>
          )
        })}
      </svg>
      <ul className="sr-only">
        {Object.entries(states).map(([label, status]) => <li key={label}>{label}: {status}</li>)}
      </ul>
      <ul className="qb-logic-legend">
        <li><span className="qb-swatch is-defined" /> Defined</li>
        <li><span className="qb-swatch is-partial" /> Partial</li>
        <li><span className="qb-swatch is-waiting" /> Waiting</li>
      </ul>
    </figure>
  )
}

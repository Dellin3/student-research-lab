import {
  EMPTY_PLANNER_DRAFT,
  RESEARCH_MODES,
  isMeaningfulText,
  normalizePlannerDraft,
  plannerDraftToRecord,
  plannerStatus,
  structureStates,
} from '../src/utils/investigationPlanner.js'

const errors = []
const assert = (condition, message) => { if (!condition) errors.push(message) }

assert(RESEARCH_MODES.length === 5, 'planner: five transparent modes expected')
for (const id of ['mathematical', 'experimental', 'observational', 'computational', 'simulation']) {
  assert(RESEARCH_MODES.some((mode) => mode.id === id), `planner: ${id} mode missing`)
}
assert(plannerStatus(EMPTY_PLANNER_DRAFT).label === 'START HERE', 'planner: empty state must coach')

const complete = normalizePlannerDraft({
  question: 'Under what conditions does this graph invariant remain unchanged?',
  mode: 'mathematical',
  evidence: 'A proof for one bounded family plus computations for small cases.',
  smallestTest: 'Check connected graphs with at most twenty vertices.',
  challenge: 'Find a boundary case or counterexample to the proposed invariant.',
  constraints: 'One month and access to a standard graph library.',
  limitation: 'Small cases do not establish the general theorem.',
  firstAction: 'Define the graph family and calculate five known examples.',
  humanReviewed: true,
})
assert(plannerStatus(complete).label === 'STRUCTURALLY COMPLETE', 'planner: complete structure not recognized')
assert(!isMeaningfulText('asdfasdfasdf'), 'planner: gibberish should not count as meaningful')
assert(plannerStatus({ ...complete, evidence: 'asdfasdfasdf' }).label !== 'STRUCTURALLY COMPLETE', 'planner: gibberish earned completion')
assert(structureStates(complete).every(([, state]) => state === 'defined'), 'planner: complete nodes should be defined')

const mapped = plannerDraftToRecord(complete)
assert(mapped.question.current === complete.question, 'planner map: question missing')
assert(
  /mathematical/i.test(mapped.investigation.mode)
    || mapped.investigation.evidenceSource.includes('Mathematical'),
  'planner map: research mode missing',
)
assert(
  mapped.investigation.smallestInvestigation === complete.smallestTest
    || mapped.investigation.smallestTest === complete.smallestTest,
  'planner map: smallest investigation missing',
)

if (errors.length) {
  console.error('Investigation Planner validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log('Investigation Planner validation passed.')
}

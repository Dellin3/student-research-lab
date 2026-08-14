import { STORAGE_KEY as QUESTION_BUILDER_KEY } from '../data/questionBuilderPresets.js'
import { generateQuestions } from './questionGenerator.js'
import { createEmptyResearchRecord, readResearchRecord } from './researchRecord.js'

export const INVESTIGATION_PLANNER_KEY = 'researchStarterLab.investigationPlanner.v1'

export const EMPTY_PLANNER_DRAFT = {
  question: '',
  mode: '',
  evidence: '',
  smallestTest: '',
  challenge: '',
  constraints: '',
  limitation: '',
  firstAction: '',
  reviewNotes: '',
  humanReviewed: false,
}

export const RESEARCH_MODES = [
  {
    id: 'mathematical',
    label: 'Mathematical / theoretical',
    evidencePrompt: 'What definitions, lemmas, derivations, small cases, or counterexamples would count as evidence?',
    evidenceExample: 'A derivation plus an exhaustive check of graphs up to 10 vertices',
    smallestExample: 'Prove the claim for one bounded family, or find the smallest counterexample',
    challengeExample: 'A counterexample or failed implication would force a revision',
  },
  {
    id: 'experimental',
    label: 'Experimental',
    evidencePrompt: 'What measurements will you collect while deliberately changing one condition?',
    evidenceExample: 'Repeated measurements under a treatment and a baseline condition',
    smallestExample: 'Run three repeatable trials at two controlled settings',
    challengeExample: 'No repeatable difference, or the baseline varies as much as the treatment',
  },
  {
    id: 'observational',
    label: 'Observational',
    evidencePrompt: 'What records or observations can you inspect without assigning a treatment?',
    evidenceExample: 'A defined sample of public records with a documented coding method',
    smallestExample: 'Code 30 records from one place and time window',
    challengeExample: 'The pattern disappears after accounting for a plausible confounder',
  },
  {
    id: 'computational',
    label: 'Computational / data',
    evidencePrompt: 'Which dataset, representation, metric, or benchmark will make the result inspectable?',
    evidenceExample: 'A public dataset, fixed train/test split, baseline, and error metric',
    smallestExample: 'Compare one method with one baseline on a small, documented subset',
    challengeExample: 'Performance does not beat the baseline or changes under a reasonable split',
  },
  {
    id: 'simulation',
    label: 'Model / simulation',
    evidencePrompt: 'Which model outputs, parameter sweeps, and comparison targets will you inspect?',
    evidenceExample: 'A parameter sweep compared with a limiting case or published measurement',
    smallestExample: 'Implement one mechanism and vary one parameter across five values',
    challengeExample: 'The model fails a known limit or cannot reproduce the comparison target',
  },
]

export const PLANNER_STEPS = [
  { id: 'question', label: 'Question' },
  { id: 'mode', label: 'Mode' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'smallest', label: 'Smallest test' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'limits', label: 'Limits' },
  { id: 'action', label: 'First action' },
]

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function isMeaningfulText(value, minimum = 8) {
  const text = clean(value)
  if (text.length < minimum) return false
  const letters = text.match(/[a-z]/gi) || []
  if (letters.length < Math.max(4, Math.floor(text.length * 0.35))) return false
  if (/(.)\1{4,}/i.test(text)) return false
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || []
  if (words.length < 2) return false
  const unique = new Set(words)
  if (words.length >= 4 && unique.size / words.length < 0.35) return false
  return true
}

export function normalizePlannerDraft(raw = {}) {
  return {
    ...EMPTY_PLANNER_DRAFT,
    ...Object.fromEntries(
      Object.keys(EMPTY_PLANNER_DRAFT)
        .filter((key) => key !== 'humanReviewed')
        .map((key) => [key, clean(raw?.[key])]),
    ),
    mode: RESEARCH_MODES.some((mode) => mode.id === raw?.mode) ? raw.mode : '',
    humanReviewed: raw?.humanReviewed === true,
  }
}

export function plannerStatus(raw = {}) {
  const draft = normalizePlannerDraft(raw)
  const meaningful = {
    question: isMeaningfulText(draft.question, 12),
    mode: Boolean(draft.mode),
    evidence: isMeaningfulText(draft.evidence),
    smallestTest: isMeaningfulText(draft.smallestTest),
    challenge: isMeaningfulText(draft.challenge),
    constraints: isMeaningfulText(draft.constraints),
    limitation: isMeaningfulText(draft.limitation),
    firstAction: isMeaningfulText(draft.firstAction),
  }
  const count = Object.values(meaningful).filter(Boolean).length
  let label = 'START HERE'
  if (meaningful.question) label = 'PLAN INCOMPLETE'
  if (meaningful.question && count >= 4) label = 'INVESTIGATION TAKING SHAPE'
  if (Object.values(meaningful).every(Boolean)) {
    label = 'STRUCTURALLY COMPLETE'
  }
  return { label, meaningful, count }
}

export function structureStates(raw = {}) {
  const draft = normalizePlannerDraft(raw)
  const status = plannerStatus(draft).meaningful
  const stateFor = (defined, started) => (defined ? 'defined' : started ? 'partial' : 'waiting')
  return [
    ['Question', stateFor(status.question, Boolean(draft.question))],
    ['Approach', stateFor(status.mode, status.question)],
    ['Evidence', stateFor(status.evidence, Boolean(draft.evidence) || status.mode)],
    ['Scope', stateFor(status.smallestTest, Boolean(draft.smallestTest) || status.evidence)],
    ['Challenge', stateFor(status.challenge, Boolean(draft.challenge) || status.smallestTest)],
    ['Limits', stateFor(status.constraints && status.limitation, Boolean(draft.constraints || draft.limitation) || status.challenge)],
    ['Action', stateFor(status.firstAction, Boolean(draft.firstAction) || status.limitation)],
  ]
}

export function getMode(modeId) {
  return RESEARCH_MODES.find((mode) => mode.id === modeId) || null
}

export function readPlannerDraft(storage) {
  try {
    return normalizePlannerDraft(JSON.parse(storage.getItem(INVESTIGATION_PLANNER_KEY) || 'null'))
  } catch {
    return { ...EMPTY_PLANNER_DRAFT }
  }
}

export function savePlannerDraft(draft, storage) {
  const normalized = normalizePlannerDraft(draft)
  storage.setItem(INVESTIGATION_PLANNER_KEY, JSON.stringify(normalized))
  return normalized
}

export function readQuestionSources(storage) {
  const sources = []
  try {
    const record = readResearchRecord(storage)
    const question = clean(record.question.current)
    if (isMeaningfulText(question, 12)) sources.push({ id: 'record', label: 'Current Research Record', question })
  } catch {
    // A malformed local record is ignored; manual entry remains available.
  }
  try {
    const builder = JSON.parse(storage.getItem(QUESTION_BUILDER_KEY) || 'null')
    if (builder && typeof builder === 'object') {
      const generated = generateQuestions(builder)
      const question = generated?.primary?.incomplete ? '' : clean(generated?.primary?.text)
      if (isMeaningfulText(question, 12) && !sources.some((source) => source.question === question)) {
        sources.push({ id: 'builder', label: 'Question Builder draft', question })
      }
    }
  } catch {
    // A malformed or incompatible builder draft is ignored.
  }
  return sources
}

export function plannerDraftToRecord(raw = {}) {
  const draft = normalizePlannerDraft(raw)
  const record = createEmptyResearchRecord()
  const mode = getMode(draft.mode)
  record.question.current = draft.question
  record.investigation.mode = mode?.label || draft.mode
  record.investigation.smallestInvestigation = draft.smallestTest
  record.investigation.evidenceTarget = draft.evidence
  record.investigation.challengeComparison = draft.challenge
  record.investigation.constraints = draft.constraints
  record.investigation.limitations = [
    draft.limitation,
    draft.reviewNotes && `Human review notes: ${draft.reviewNotes}`,
  ].filter(Boolean).join('\n')
  record.investigation.firstAction = draft.firstAction
  record.next.action = draft.firstAction
  record.next.output = 'A first inspectable result from the investigation plan.'
  return record
}

export function planSummary(raw = {}) {
  const draft = normalizePlannerDraft(raw)
  return [
    ['Question', draft.question],
    ['Mode', getMode(draft.mode)?.label || 'Not chosen'],
    ['Evidence', draft.evidence],
    ['Smallest version', draft.smallestTest],
    ['What could challenge it', draft.challenge],
    ['Constraints', draft.constraints],
    ['Limitation', draft.limitation],
    ['First action', draft.firstAction],
  ]
}

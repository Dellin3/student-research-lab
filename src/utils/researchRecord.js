export const RESEARCH_RECORD_KEY = 'research-starter-worksheet'
export const RESEARCH_RECORD_VERSION = 2

const SHAPE = {
  startingPoint: ['interest', 'direction', 'phenomenon'],
  question: ['current', 'history'],
  literature: ['sources', 'expertPatterns', 'unknownConcepts'],
  investigation: ['smallestTest', 'evidenceSource', 'assumptions', 'limitations'],
  feedbackRevision: ['mentors', 'feedback', 'revisions'],
  next: ['action', 'output'],
}

function text(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join('\n')
  if (value == null || typeof value === 'object') return ''
  return String(value).trim()
}

export function createEmptyResearchRecord() {
  return {
    version: RESEARCH_RECORD_VERSION,
    startingPoint: { interest: '', direction: '', phenomenon: '' },
    question: { current: '', history: '' },
    literature: { sources: '', expertPatterns: '', unknownConcepts: '' },
    investigation: { smallestTest: '', evidenceSource: '', assumptions: '', limitations: '' },
    feedbackRevision: { mentors: '', feedback: '', revisions: '' },
    next: { action: '', output: '' },
  }
}

function isRecordLike(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

export function migrateResearchRecord(raw) {
  const empty = createEmptyResearchRecord()
  if (!isRecordLike(raw)) return empty

  const isNested = Object.keys(SHAPE).some((group) => isRecordLike(raw[group]))
  if (isNested) {
    for (const [group, fields] of Object.entries(SHAPE)) {
      for (const field of fields) empty[group][field] = text(raw[group]?.[field])
    }
  } else {
    empty.startingPoint.interest = text(raw.interest)
    empty.startingPoint.direction = text(raw.direction || raw.field)
    empty.startingPoint.phenomenon = text(raw.phenomenon)
    empty.question.current = text(raw.currentQuestion || raw.question || raw.questions)
    empty.question.history = text(raw.questionHistory)
    empty.literature.sources = text(raw.sources || raw.literature)
    empty.literature.expertPatterns = text(raw.expertPatterns)
    empty.literature.unknownConcepts = text(raw.unknownConcepts)
    empty.investigation.smallestTest = text(raw.smallestTest || raw.toyModel)
    empty.investigation.evidenceSource = text(raw.evidenceSource || raw.data)
    empty.investigation.assumptions = text(raw.assumptions)
    empty.investigation.limitations = text(raw.limitations)
    empty.feedbackRevision.mentors = text(raw.mentors)
    empty.feedbackRevision.feedback = text(raw.feedback)
    empty.feedbackRevision.revisions = text(raw.revisions)
    empty.next.action = text(raw.nextAction)
    empty.next.output = text(raw.output)
  }

  const known = new Set(['version', ...Object.keys(SHAPE), 'interest', 'direction', 'field', 'phenomenon',
    'currentQuestion', 'question', 'questions', 'questionHistory', 'sources', 'literature',
    'expertPatterns', 'unknownConcepts', 'smallestTest', 'toyModel', 'evidenceSource', 'data',
    'assumptions', 'limitations', 'mentors', 'feedback', 'revisions', 'nextAction', 'output'])
  const extras = Object.fromEntries(
    Object.entries(raw).filter(([key, value]) => !known.has(key) && value != null),
  )
  if (Object.keys(extras).length) empty.legacy = extras
  return empty
}

export function researchRecordHasContent(record) {
  const migrated = migrateResearchRecord(record)
  return Object.entries(SHAPE).some(([group, fields]) =>
    fields.some((field) => Boolean(migrated[group][field])),
  )
}

export function readResearchRecord(storage) {
  try {
    return migrateResearchRecord(JSON.parse(storage.getItem(RESEARCH_RECORD_KEY) || 'null'))
  } catch {
    return createEmptyResearchRecord()
  }
}

export function saveResearchRecord(record, storage) {
  const migrated = migrateResearchRecord(record)
  storage.setItem(RESEARCH_RECORD_KEY, JSON.stringify(migrated))
  return migrated
}

export function clearResearchRecord(storage) {
  storage.removeItem(RESEARCH_RECORD_KEY)
  return createEmptyResearchRecord()
}

export function builderDraftToRecord(state = {}, question = '') {
  const record = createEmptyResearchRecord()
  record.startingPoint.interest = text(state.broadInterest)
  record.startingPoint.direction = text(state.field)
  record.startingPoint.phenomenon = text(state.phenomenon)
  record.question.current = text(question)
  record.investigation.smallestTest = text(state.smallestVersion)
  record.investigation.evidenceSource = text(state.evidenceSource)
  record.investigation.limitations = [text(state.mainConstraint), state.timeAvailable && `Time available: ${text(state.timeAvailable)}`]
    .filter(Boolean).join('\n')
  record.next.action = 'Refine the question and identify the first inspectable test.'
  return record
}

function identityFieldsDiffer(existing, incoming) {
  const keys = [
    ['startingPoint', 'interest'],
    ['startingPoint', 'direction'],
    ['startingPoint', 'phenomenon'],
    ['question', 'current'],
  ]
  return keys.some(([group, field]) => {
    const next = incoming[group][field]
    return Boolean(next) && existing[group][field] !== next
  })
}

export function recordsWouldConflict(existing, incoming) {
  const current = migrateResearchRecord(existing)
  const next = migrateResearchRecord(incoming)
  if (!researchRecordHasContent(current) || !researchRecordHasContent(next)) return false
  return identityFieldsDiffer(current, next)
}

export function builderImportNeedsConfirmation(record, state, question) {
  return recordsWouldConflict(record, builderDraftToRecord(state, question))
}

export function importMappedDraft(record, incoming, mode = 'keep') {
  const current = migrateResearchRecord(record)
  const next = migrateResearchRecord(incoming)
  if (mode === 'keep') {
    if (!researchRecordHasContent(current)) return next
    return current
  }

  const existingQuestion = current.question.current
  for (const [group, fields] of Object.entries(SHAPE)) {
    for (const field of fields) {
      if (next[group][field]) current[group][field] = next[group][field]
    }
  }
  if (next.question.current && existingQuestion && existingQuestion !== next.question.current) {
    current.question.history = [current.question.history, existingQuestion].filter(Boolean).join('\n')
    current.question.current = next.question.current
  }
  return current
}

/**
 * Import a builder draft without hidden merging.
 * "keep" leaves an existing record unchanged (or fills an empty one).
 * "replace" overlays incoming mapped fields and moves the old question to history.
 */
export function importBuilderDraft(record, state, question, mode = 'keep') {
  return importMappedDraft(record, builderDraftToRecord(state, question), mode)
}

export function narrowingDraftToRecord(state = {}, directionText = '') {
  const record = createEmptyResearchRecord()
  const discipline = text(state.discipline)
  const lens = text(state.lensLabel)
  record.startingPoint.interest = text(state.interest)
  record.startingPoint.direction = text(directionText) || [discipline, lens].filter(Boolean).join(' · ')
  record.startingPoint.phenomenon = text(state.object)
  record.next.action = 'Continue to Question Builder to form a testable or provable question from this direction.'
  return record
}

export function narrowingImportNeedsConfirmation(record, state, directionText) {
  return recordsWouldConflict(record, narrowingDraftToRecord(state, directionText))
}

export function importNarrowingDraft(record, state, directionText, mode = 'keep') {
  return importMappedDraft(record, narrowingDraftToRecord(state, directionText), mode)
}

export const RESEARCH_RECORD_KEY = 'research-starter-worksheet'
export const RESEARCH_RECORD_VERSION = 3
export const MAX_RESEARCH_RECORD_IMPORT_BYTES = 1024 * 1024

const GROUP_SHAPE = {
  startingPoint: ['interest', 'direction', 'phenomenon'],
  question: ['current', 'history'],
  literature: ['sources', 'expertPatterns', 'unknownConcepts'],
  investigation: [
    'mode',
    'smallestInvestigation',
    'evidenceTarget',
    'challengeComparison',
    'constraints',
    'limitations',
    'firstAction',
    // Retained aliases keep R1/R2 integrations and saved records working.
    'smallestTest',
    'evidenceSource',
    'assumptions',
  ],
  feedbackRevision: ['mentors', 'feedback', 'revisions'],
  next: ['action', 'output'],
}

const LOG_FIELDS = {
  sourceLog: ['title', 'author', 'year', 'url', 'type', 'purpose', 'contribution', 'method', 'limitation', 'unresolved'],
  evidenceLog: ['finding', 'source', 'relevance', 'limitation', 'next'],
  revisionHistory: ['date', 'change', 'reason', 'trigger'],
}

function isRecordLike(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function text(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join('\n')
  if (value == null || typeof value === 'object') return ''
  return String(value).trim()
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone)
  if (!isRecordLike(value)) return value
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]))
}

function makeId(prefix = 'entry') {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createSourceLogEntry(values = {}) {
  const entry = { ...clone(isRecordLike(values) ? values : {}), id: text(values.id) || makeId('source') }
  for (const field of LOG_FIELDS.sourceLog) entry[field] = text(values[field])
  entry.verifiedOriginal = values.verifiedOriginal === true
  return entry
}

export function createEvidenceLogEntry(values = {}) {
  const entry = { ...clone(isRecordLike(values) ? values : {}), id: text(values.id) || makeId('evidence') }
  for (const field of LOG_FIELDS.evidenceLog) entry[field] = text(values[field])
  entry.stance = ['support', 'challenge', 'complicate', 'unclear'].includes(values.stance)
    ? values.stance
    : 'unclear'
  return entry
}

export function createRevisionEntry(values = {}) {
  const entry = { ...clone(isRecordLike(values) ? values : {}), id: text(values.id) || makeId('revision') }
  for (const field of LOG_FIELDS.revisionHistory) entry[field] = text(values[field])
  return entry
}

export function createEmptyResearchRecord() {
  return {
    version: RESEARCH_RECORD_VERSION,
    startingPoint: { interest: '', direction: '', phenomenon: '' },
    question: { current: '', history: '' },
    literature: { sources: '', expertPatterns: '', unknownConcepts: '' },
    investigation: {
      mode: '',
      smallestInvestigation: '',
      evidenceTarget: '',
      challengeComparison: '',
      constraints: '',
      limitations: '',
      firstAction: '',
      smallestTest: '',
      evidenceSource: '',
      assumptions: '',
    },
    sourceLog: [],
    evidenceLog: [],
    feedbackRevision: { mentors: '', feedback: '', revisions: '' },
    revisionHistory: [],
    next: { action: '', output: '' },
  }
}

/**
 * Upgrade any prior record without discarding unknown root, group, or log-entry fields.
 */
export function migrateResearchRecord(raw) {
  const empty = createEmptyResearchRecord()
  if (!isRecordLike(raw)) return empty

  const migrated = { ...clone(raw), ...empty }
  const isNested = Object.keys(GROUP_SHAPE).some((group) => isRecordLike(raw[group]))

  for (const [group, fields] of Object.entries(GROUP_SHAPE)) {
    migrated[group] = { ...(isRecordLike(raw[group]) ? clone(raw[group]) : {}), ...empty[group] }
    for (const field of fields) migrated[group][field] = text(raw[group]?.[field])
  }

  if (!isNested) {
    migrated.startingPoint.interest = text(raw.interest)
    migrated.startingPoint.direction = text(raw.direction || raw.field)
    migrated.startingPoint.phenomenon = text(raw.phenomenon)
    migrated.question.current = text(raw.currentQuestion || raw.question || raw.questions)
    migrated.question.history = text(raw.questionHistory)
    migrated.literature.sources = text(raw.sources || raw.literature)
    migrated.literature.expertPatterns = text(raw.expertPatterns)
    migrated.literature.unknownConcepts = text(raw.unknownConcepts)
    migrated.investigation.smallestInvestigation = text(raw.smallestInvestigation || raw.smallestTest || raw.toyModel)
    migrated.investigation.evidenceTarget = text(raw.evidenceTarget || raw.evidenceSource || raw.data)
    migrated.investigation.challengeComparison = text(raw.challengeComparison || raw.assumptions)
    migrated.investigation.constraints = text(raw.constraints)
    migrated.investigation.limitations = text(raw.limitations)
    migrated.investigation.firstAction = text(raw.firstAction)
    migrated.feedbackRevision.mentors = text(raw.mentors)
    migrated.feedbackRevision.feedback = text(raw.feedback)
    migrated.feedbackRevision.revisions = text(raw.revisions)
    migrated.next.action = text(raw.nextAction)
    migrated.next.output = text(raw.output)
  }

  const investigation = migrated.investigation
  investigation.smallestInvestigation ||= text(raw.investigation?.smallestTest)
  investigation.evidenceTarget ||= text(raw.investigation?.evidenceSource)
  investigation.challengeComparison ||= text(raw.investigation?.assumptions)
  investigation.firstAction ||= migrated.next.action
  investigation.smallestTest = investigation.smallestInvestigation
  investigation.evidenceSource = investigation.evidenceTarget
  investigation.assumptions ||= investigation.challengeComparison

  migrated.sourceLog = Array.isArray(raw.sourceLog) ? raw.sourceLog.map(createSourceLogEntry) : []
  migrated.evidenceLog = Array.isArray(raw.evidenceLog) ? raw.evidenceLog.map(createEvidenceLogEntry) : []
  migrated.revisionHistory = Array.isArray(raw.revisionHistory) ? raw.revisionHistory.map(createRevisionEntry) : []
  migrated.version = RESEARCH_RECORD_VERSION

  const flatKnown = new Set([
    'version', ...Object.keys(GROUP_SHAPE), ...Object.keys(LOG_FIELDS), 'interest', 'direction', 'field',
    'phenomenon', 'currentQuestion', 'question', 'questions', 'questionHistory', 'sources', 'literature',
    'expertPatterns', 'unknownConcepts', 'smallestInvestigation', 'smallestTest', 'toyModel',
    'evidenceTarget', 'evidenceSource', 'data', 'challengeComparison', 'assumptions', 'constraints',
    'limitations', 'firstAction', 'mentors', 'feedback', 'revisions', 'nextAction', 'output', 'legacy',
  ])
  const unknownFlat = Object.fromEntries(
    Object.entries(raw).filter(([key, value]) => !flatKnown.has(key) && value != null),
  )
  if (Object.keys(unknownFlat).length) {
    migrated.legacy = { ...(isRecordLike(raw.legacy) ? clone(raw.legacy) : {}), ...clone(unknownFlat) }
  }
  return migrated
}

export function researchRecordHasContent(record) {
  const migrated = migrateResearchRecord(record)
  return Object.entries(GROUP_SHAPE).some(([group, fields]) =>
    fields.some((field) => Boolean(migrated[group][field])),
  ) || migrated.sourceLog.length > 0 || migrated.evidenceLog.length > 0 || migrated.revisionHistory.length > 0
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

export function validateResearchRecordImport(raw) {
  if (!isRecordLike(raw)) throw new Error('The JSON must contain one Research Record object.')
  if (!Number.isInteger(raw.version) || raw.version < 1) {
    throw new Error('The file is missing a valid Research Record version.')
  }
  if (raw.version > RESEARCH_RECORD_VERSION) {
    throw new Error(`This record uses version ${raw.version}; this page supports up to version ${RESEARCH_RECORD_VERSION}.`)
  }
  const hasKnownData = Object.keys(GROUP_SHAPE).some((key) => key in raw)
    || Object.keys(LOG_FIELDS).some((key) => key in raw)
  if (!hasKnownData) throw new Error('The file does not match the Research Record schema.')
  return raw
}

export function parseResearchRecordImport(json, maxBytes = MAX_RESEARCH_RECORD_IMPORT_BYTES) {
  if (typeof json !== 'string') throw new Error('Choose a JSON text file to import.')
  if (new TextEncoder().encode(json).byteLength > maxBytes) {
    throw new Error(`The import is too large. Maximum size is ${Math.round(maxBytes / 1024)} KB.`)
  }
  let raw
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('The selected file is not valid JSON.')
  }
  return migrateResearchRecord(validateResearchRecordImport(raw))
}

function mergeValues(current, incoming) {
  if (Array.isArray(incoming)) return clone(incoming)
  if (isRecordLike(current) && isRecordLike(incoming)) {
    const merged = clone(current)
    for (const [key, value] of Object.entries(incoming)) merged[key] = mergeValues(current[key], value)
    return merged
  }
  return incoming === '' || incoming == null ? current : clone(incoming)
}

export function mergeResearchRecords(current, incoming) {
  const existing = migrateResearchRecord(current)
  const next = migrateResearchRecord(incoming)
  const merged = mergeValues(existing, next)
  for (const log of Object.keys(LOG_FIELDS)) {
    const byId = new Map(existing[log].map((entry) => [entry.id, entry]))
    for (const entry of next[log]) byId.set(entry.id, mergeValues(byId.get(entry.id) || {}, entry))
    merged[log] = [...byId.values()]
  }
  return migrateResearchRecord(merged)
}

export function replaceResearchRecord(_current, incoming) {
  return migrateResearchRecord(incoming)
}

export function importResearchRecord(current, json, mode) {
  const incoming = parseResearchRecordImport(json)
  if (mode === 'merge') return mergeResearchRecords(current, incoming)
  if (mode === 'replace') return replaceResearchRecord(current, incoming)
  throw new Error('Choose merge or replace before importing.')
}

export function exportResearchRecordJson(record) {
  return JSON.stringify(migrateResearchRecord(record), null, 2)
}

function markdownSection(title, values) {
  const lines = values.filter(([, value]) => text(value))
    .map(([label, value]) => `### ${label}\n${text(value)}`)
  return lines.length ? `## ${title}\n\n${lines.join('\n\n')}` : ''
}

export function exportResearchRecordMarkdown(record) {
  const value = migrateResearchRecord(record)
  const sections = [
    '# Research Record',
    markdownSection('Starting point', [['Interest', value.startingPoint.interest], ['Direction / discipline', value.startingPoint.direction], ['Phenomenon', value.startingPoint.phenomenon]]),
    markdownSection('Question', [['Current question', value.question.current], ['Question history', value.question.history]]),
    markdownSection('Investigation', [['Mode', value.investigation.mode], ['Smallest investigation', value.investigation.smallestInvestigation], ['Evidence target', value.investigation.evidenceTarget], ['Challenge / comparison', value.investigation.challengeComparison], ['Constraints', value.investigation.constraints], ['Limitations', value.investigation.limitations], ['First action', value.investigation.firstAction]]),
    value.sourceLog.length ? `## Source log\n\n${value.sourceLog.map((entry) => `### ${entry.title || 'Untitled source'}\n${[
      entry.author && `- Author: ${entry.author}`, entry.year && `- Year: ${entry.year}`,
      entry.url && `- URL: ${entry.url}`, entry.type && `- Type: ${entry.type}`,
      entry.purpose && `- Purpose: ${entry.purpose}`, entry.contribution && `- Contribution: ${entry.contribution}`,
      entry.method && `- Method: ${entry.method}`, entry.limitation && `- Limitation: ${entry.limitation}`,
      entry.unresolved && `- Unresolved: ${entry.unresolved}`, `- Original checked: ${entry.verifiedOriginal ? 'Yes' : 'No'}`,
    ].filter(Boolean).join('\n')}`).join('\n\n')}` : '',
    value.evidenceLog.length ? `## Evidence log\n\n${value.evidenceLog.map((entry) => `### ${entry.finding || 'Unlabeled finding'}\n${[
      entry.source && `- Source: ${entry.source}`, entry.relevance && `- Relevance: ${entry.relevance}`,
      `- Stance: ${entry.stance}`, entry.limitation && `- Limitation: ${entry.limitation}`,
      entry.next && `- Next: ${entry.next}`,
    ].filter(Boolean).join('\n')}`).join('\n\n')}` : '',
    value.revisionHistory.length ? `## Revision history\n\n${value.revisionHistory.map((entry) =>
      `- ${entry.date || 'Undated'} — ${entry.change || 'Change not described'}${entry.reason ? `; reason: ${entry.reason}` : ''}${entry.trigger ? `; trigger: ${entry.trigger}` : ''}`
    ).join('\n')}` : '',
    markdownSection('Next', [['Next action', value.next.action], ['Next output', value.next.output]]),
  ]
  return `${sections.filter(Boolean).join('\n\n')}\n`
}

export function createMentorBrief(record) {
  const value = migrateResearchRecord(record)
  const sources = value.sourceLog.filter((entry) => entry.title).slice(0, 4).map((entry) => entry.title).join('; ')
  const evidence = value.evidenceLog.filter((entry) => entry.finding).slice(0, 4)
    .map((entry) => `${entry.finding} (${entry.stance})`).join('; ')
  return [
    `Current question: ${value.question.current || 'Not recorded yet.'}`,
    `Smallest investigation: ${value.investigation.smallestInvestigation || 'Not recorded yet.'}`,
    `Evidence target: ${value.investigation.evidenceTarget || 'Not recorded yet.'}`,
    `Sources reviewed: ${sources || 'None logged yet.'}`,
    `Evidence so far: ${evidence || 'None logged yet.'}`,
    `Known limitations: ${value.investigation.limitations || 'Not recorded yet.'}`,
    `Next action: ${value.investigation.firstAction || value.next.action || 'Not recorded yet.'}`,
    'What I need from a mentor: Please challenge the question, evidence, method, and next step.',
  ].join('\n\n')
}

export function plannerDraftToRecord(state = {}) {
  const record = createEmptyResearchRecord()
  record.question.current = text(state.question)
  record.investigation.mode = text(state.mode)
  record.investigation.smallestInvestigation = text(state.smallestInvestigation || state.smallestTest)
  record.investigation.evidenceTarget = text(state.evidenceTarget || state.evidenceSource || state.evidence)
  record.investigation.challengeComparison = text(state.challengeComparison || state.comparison || state.challenge)
  record.investigation.constraints = text(state.constraints)
  record.investigation.limitations = [text(state.limitations || state.limitation),
    state.reviewNotes && `Human review notes: ${text(state.reviewNotes)}`].filter(Boolean).join('\n')
  record.investigation.firstAction = text(state.firstAction)
  record.next.action = record.investigation.firstAction
  record.next.output = text(state.nextOutput)
  return migrateResearchRecord(record)
}

export function plannerImportNeedsConfirmation(record, state) {
  return recordsWouldConflict(record, plannerDraftToRecord(state))
    || Boolean(migrateResearchRecord(record).investigation.smallestInvestigation
      && plannerDraftToRecord(state).investigation.smallestInvestigation)
}

export function importPlannerDraft(record, state, mode = 'keep') {
  return importMappedDraft(record, plannerDraftToRecord(state), mode)
}

export function builderDraftToRecord(state = {}, question = '') {
  const record = createEmptyResearchRecord()
  record.startingPoint.interest = text(state.broadInterest)
  record.startingPoint.direction = text(state.field)
  record.startingPoint.phenomenon = text(state.phenomenon)
  record.question.current = text(question)
  record.investigation.smallestInvestigation = text(state.smallestVersion)
  record.investigation.evidenceTarget = text(state.evidenceSource)
  record.investigation.constraints = [text(state.mainConstraint), state.timeAvailable && `Time available: ${text(state.timeAvailable)}`]
    .filter(Boolean).join('\n')
  record.investigation.limitations = text(state.limitations)
  record.investigation.firstAction = 'Refine the question and identify the first inspectable test.'
  record.next.action = record.investigation.firstAction
  return migrateResearchRecord(record)
}

function identityFieldsDiffer(existing, incoming) {
  return [['startingPoint', 'interest'], ['startingPoint', 'direction'], ['startingPoint', 'phenomenon'], ['question', 'current']]
    .some(([group, field]) => Boolean(incoming[group][field]) && existing[group][field] !== incoming[group][field])
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
  if (mode === 'keep') return researchRecordHasContent(current) ? current : next
  if (mode !== 'replace') throw new Error('Draft import mode must be keep or replace.')

  const existingQuestion = current.question.current
  for (const [group, fields] of Object.entries(GROUP_SHAPE)) {
    for (const field of fields) if (next[group][field]) current[group][field] = next[group][field]
  }
  if (next.question.current && existingQuestion && existingQuestion !== next.question.current) {
    current.question.history = [current.question.history, existingQuestion].filter(Boolean).join('\n')
    current.question.current = next.question.current
  }
  return migrateResearchRecord(current)
}

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

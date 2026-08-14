import {
  RESEARCH_RECORD_KEY,
  builderDraftToRecord,
  builderImportNeedsConfirmation,
  createEvidenceLogEntry,
  createSourceLogEntry,
  exportResearchRecordJson,
  exportResearchRecordMarkdown,
  importResearchRecord,
  importBuilderDraft,
  migrateResearchRecord,
  readResearchRecord,
  saveResearchRecord,
} from '../src/utils/researchRecord.js'

const errors = []
const assert = (condition, message) => { if (!condition) errors.push(message) }

const legacy = {
  interest: 'urban heat',
  field: 'Environmental Science',
  phenomenon: 'surface temperature differences',
  questions: 'How is canopy associated with temperature?',
  data: 'public satellite dataset',
  toyModel: 'compare ten neighborhoods',
  limitations: 'coarse spatial resolution',
  nextAction: 'download one summer scene',
  unexpectedLegacyNote: 'keep this note',
}
const migrated = migrateResearchRecord(legacy)
assert(migrated.version === 3, 'migration: version missing')
assert(migrated.startingPoint.interest === legacy.interest, 'migration: interest lost')
assert(migrated.question.current === legacy.questions, 'migration: question lost')
assert(migrated.investigation.evidenceSource === legacy.data, 'migration: evidence lost')
assert(migrated.legacy?.unexpectedLegacyNote === 'keep this note', 'migration: unknown legacy work lost')

for (const malformed of [null, 12, 'bad', [], { question: { current: { bad: true } } }]) {
  const result = migrateResearchRecord(malformed)
  assert(result.version === 3 && typeof result.question.current === 'string', 'malformed: safe empty record expected')
}

const state = {
  field: 'Physics',
  broadInterest: 'optics',
  phenomenon: 'signal attenuation',
  evidenceSource: 'published measurements',
  smallestVersion: 'measure one wavelength range',
}
const mapped = builderDraftToRecord(state, 'How does thickness affect attenuation?')
assert(mapped.startingPoint.direction === 'Physics', 'builder map: discipline missing')

const existing = migrateResearchRecord({ questions: 'Existing question', interest: 'existing interest' })
assert(builderImportNeedsConfirmation(existing, state, mapped.question.current), 'conflict: unrelated record must require a choice')
const kept = importBuilderDraft(existing, state, mapped.question.current, 'keep')
assert(kept.question.current === 'Existing question', 'keep: current question overwritten')
assert(kept.startingPoint.interest === 'existing interest', 'keep: existing interest overwritten')
assert(kept.startingPoint.phenomenon === '', 'keep: builder phenomenon mixed into unrelated record')
const replaced = importBuilderDraft(existing, state, mapped.question.current, 'replace')
assert(replaced.question.current === mapped.question.current, 'replace: builder question not imported')
assert(replaced.question.history.includes('Existing question'), 'replace: old question not preserved in history')
assert(replaced.startingPoint.interest === 'optics', 'replace: mapped interest not imported')
assert(!builderImportNeedsConfirmation(migrateResearchRecord({}), state, mapped.question.current), 'empty record must import without a prompt')

const values = new Map()
const storage = {
  getItem: (key) => values.get(key) || null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
}
saveResearchRecord(replaced, storage)
assert(values.has(RESEARCH_RECORD_KEY), 'storage: established key not used')
assert(readResearchRecord(storage).question.current === mapped.question.current, 'storage: reload failed')
values.set(RESEARCH_RECORD_KEY, '{bad json')
assert(readResearchRecord(storage).question.current === '', 'storage: malformed JSON should recover')

const expanded = migrateResearchRecord(replaced)
expanded.sourceLog.push(createSourceLogEntry({
  title: '<script>alert(1)</script>',
  url: 'javascript:alert(1)',
  contribution: 'A source note, not evidence.',
  verifiedOriginal: true,
}))
expanded.evidenceLog.push(createEvidenceLogEntry({
  finding: 'The bounded calculation produced a counterexample.',
  stance: 'challenge',
}))
const json = exportResearchRecordJson(expanded)
assert(JSON.parse(json).version === 3, 'export: JSON must be versioned')
assert(exportResearchRecordMarkdown(expanded).includes('## Source log'), 'export: Markdown source log missing')
assert(exportResearchRecordMarkdown(expanded).includes('## Evidence log'), 'export: Markdown evidence log missing')
const imported = importResearchRecord(migrateResearchRecord({ questions: 'Keep me' }), json, 'merge')
assert(imported.sourceLog[0].title === '<script>alert(1)</script>', 'import: strings must remain inert data')
assert(imported.evidenceLog[0].stance === 'challenge', 'import: evidence stance lost')
assert(imported.question.current === mapped.question.current, 'import: valid merge did not restore question')
let rejected = false
try { importResearchRecord(existing, '{"version":3,"wrong":true}', 'replace') } catch { rejected = true }
assert(rejected, 'import: wrong schema must be rejected')
rejected = false
try { importResearchRecord(existing, '{bad json', 'replace') } catch { rejected = true }
assert(rejected, 'import: malformed JSON must be rejected safely')

if (errors.length) {
  console.error('Research Record validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log('Research Record validation passed.')
}

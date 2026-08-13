import { generateDirections, isMathematicalDiscipline } from '../src/utils/topicNarrowing.js'
import { LENSES_BY_DISCIPLINE } from '../src/data/topicNarrowingPresets.js'
import {
  importNarrowingDraft,
  migrateResearchRecord,
  narrowingImportNeedsConfirmation,
} from '../src/utils/researchRecord.js'

const errors = []
const assert = (condition, message) => { if (!condition) errors.push(message) }

assert(isMathematicalDiscipline('Mathematics'), 'math: discipline detector failed')
assert(!isMathematicalDiscipline('Physics'), 'math: physics must not be treated as mathematics')

const mathLenses = LENSES_BY_DISCIPLINE.Mathematics.map((item) => item.id)
assert(mathLenses.includes('structure') && mathLenses.includes('counterexample'), 'math: expected mathematical lenses')
assert(!mathLenses.includes('measurement'), 'math: experimental measurement lens leaked into mathematics')

const math = generateDirections({
  discipline: 'Mathematics',
  interest: 'graph theory',
  object: 'triangle-free graphs',
  lens: 'extremal',
  boundary: 'graphs with a fixed maximum degree',
})
assert(math.length >= 2 && math.length <= 3, 'math: expected 2–3 structural directions')
assert(/extremal/i.test(math[0].text), 'math: chosen lens should shape the first direction')
assert(!/measur(?:e|ed|ement)|survey|sample of students/i.test(math.map((item) => item.text).join(' ')), 'math: experimental language leaked into mathematical directions')

const cs = generateDirections({
  discipline: 'Computer Science',
  interest: 'image compression',
  object: 'compressed images fed to a classifier',
  lens: 'robustness',
  boundary: 'one public image benchmark',
})
assert(cs.some((item) => /robustness|benchmark|algorithm|dataset/i.test(`${item.lensLabel} ${item.text}`)), 'cs: CS-specific narrowing missing')

const bio = generateDirections({
  discipline: 'Biology',
  interest: 'antibiotic exposure',
  object: 'bacterial growth after a short antibiotic pulse',
  lens: 'measurement',
  boundary: 'one laboratory strain',
})
assert(bio[0] && /Measure|Compare|Probe|Track|Inspect/i.test(bio[0].text), 'bio: measurement/phenomenon path missing')

const social = generateDirections({
  discipline: 'Social Science',
  interest: 'school stress',
  object: 'reported stress after the morning commute',
  lens: 'operationalization',
  boundary: 'students at one school during a two-week window',
})
assert(social[0] && /Operationalize|population|Compare|Observe/i.test(social[0].text), 'social: operationalization path missing')

assert(generateDirections({ discipline: 'Mathematics', interest: 'graphs' }).length === 0, 'empty: directions must not appear before object, lens, and boundary')

const existing = migrateResearchRecord({ interest: 'urban heat', questions: 'Existing question' })
const narrowingState = {
  discipline: 'Mathematics',
  interest: 'combinatorics',
  object: 'restricted lattice paths',
  lensLabel: 'Structure',
}
assert(narrowingImportNeedsConfirmation(existing, narrowingState, 'Inspect restricted lattice paths within a bounded grid.'), 'narrowing conflict: unrelated record must require a choice')
const kept = importNarrowingDraft(existing, narrowingState, 'Inspect restricted lattice paths within a bounded grid.', 'keep')
assert(kept.startingPoint.interest === 'urban heat', 'narrowing keep: existing interest overwritten')
const replaced = importNarrowingDraft(existing, narrowingState, 'Inspect restricted lattice paths within a bounded grid.', 'replace')
assert(replaced.startingPoint.interest === 'combinatorics', 'narrowing replace: direction not imported')
assert(replaced.question.current === 'Existing question', 'narrowing replace: must not invent a question')

if (errors.length) {
  console.error('Topic narrowing validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log('Topic narrowing validation passed.')
}

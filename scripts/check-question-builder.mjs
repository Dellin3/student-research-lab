import { BUILDER_EXAMPLES, FIELD_PRESETS, RELATION_TYPES } from '../src/data/questionBuilderPresets.js'
import { evaluateDiagnostics } from '../src/utils/questionDiagnostics.js'
import { buildResearchRecord, generateQuestions } from '../src/utils/questionGenerator.js'

const errors = []

function assert(condition, message) {
  if (!condition) errors.push(message)
}

function assertIncludes(text, fragment, message) {
  assert(String(text).includes(fragment), message)
}

function assertNoBrokenSlots(text, message) {
  assert(!/\[\s*\]/.test(text), `${message}: empty bracket slot`)
  assert(!/\bundefined\b/i.test(text), `${message}: contains undefined`)
  assert(!/\bnull\b/i.test(text), `${message}: contains null`)
  assert(!/How does\s+affect/i.test(text), `${message}: broken relationship grammar`)
  assert(!/differ between\s+in\s/i.test(text), `${message}: broken comparison grammar`)
}

// A. EMPTY STATE
{
  const result = generateQuestions({})
  const diagnostics = evaluateDiagnostics({})
  assert(result.candidates.every((item) => item.incomplete || !item.text), 'EMPTY: should not invent a complete question')
  assert(diagnostics.overallStatus === 'START HERE', 'EMPTY: overall should start here')
  assert(diagnostics.dimensions.every((item) => item.score === 0), 'EMPTY: all dimensions should be 0')
}

// B. PARTIAL STATE
{
  const result = generateQuestions({
    broadInterest: "Saturn's rings",
    phenomenon: 'fine radial structure',
  })
  assert(result.diagnostics.warnings.some((item) => /not yet a research question|bound the setting|concrete/i.test(item)) || result.diagnostics.missingPieces.length > 0, 'PARTIAL: should report missing pieces or warnings')
  assert(result.diagnostics.dimensions.find((item) => item.id === 'specificity').score >= 1, 'PARTIAL: specificity should improve')
  if (result.primary) assertNoBrokenSlots(result.primary.text, 'PARTIAL primary')
}

// C. STRONG RELATIONSHIP QUESTION
{
  const state = {
    field: 'Physics',
    broadInterest: "Saturn's rings",
    phenomenon: 'how fine radial structure appears in occultation-derived profiles',
    factor: 'radial sampling resolution',
    outcome: 'detected peak structure',
    context: 'a bounded Cassini RSS profile window',
    evidenceSource: 'public Cassini/PDS-derived educational profile',
    evidenceAccess: 'I already have it',
    methodType: 'compare',
    timeAvailable: '2–4 weeks',
    smallestVersion: 'compare the same bounded profile window at several controlled resolutions',
  }
  const result = generateQuestions(state)
  assert(result.candidates.some((item) => item.id === 'relationship'), 'RELATIONSHIP: should include relationship structure')
  assertIncludes(result.primary.text, 'radial sampling resolution', 'RELATIONSHIP: primary should use factor')
  assertIncludes(result.primary.text, 'detected peak structure', 'RELATIONSHIP: primary should use outcome')
  assert(result.diagnostics.overallStatus !== 'START HERE', 'RELATIONSHIP: should not remain at start')
  result.candidates.forEach((item) => assertNoBrokenSlots(item.text, 'RELATIONSHIP candidate'))
}

// D. COMPARISON QUESTION
{
  const result = generateQuestions({
    field: 'Environmental Science',
    broadInterest: 'urban heat',
    phenomenon: 'afternoon surface temperature differences',
    factor: 'tree canopy cover',
    outcome: 'afternoon land surface temperature',
    context: 'neighborhoods in one city during summer afternoons',
    comparison: 'high-canopy vs. low-canopy neighborhoods',
    evidenceSource: 'public dataset',
    evidenceAccess: 'I know where to get it',
    methodType: 'compare',
    timeAvailable: '1–2 months',
    smallestVersion: 'compare ten neighborhoods using one public summer dataset',
  })
  assert(result.candidates.some((item) => item.id === 'comparison'), 'COMPARISON: missing comparison structure')
  assertIncludes(
    result.candidates.find((item) => item.id === 'comparison').text,
    'high-canopy vs. low-canopy neighborhoods',
    'COMPARISON: should embed comparison text',
  )
}

// E. MATHEMATICS QUESTION
{
  const example = BUILDER_EXAMPLES.find((item) => item.id === 'mathematics')
  const result = generateQuestions(example.state)
  assert(result.candidates.some((item) => item.id === 'mathematical'), 'MATH: should produce mathematical structure')
  assertIncludes(
    result.candidates.find((item) => item.id === 'mathematical').text,
    'Under what conditions',
    'MATH: should use mathematical wording',
  )
  assert(result.diagnostics.mathematicalMode === true, 'MATH: mathematicalMode should be true')
  result.candidates.forEach((item) => assertNoBrokenSlots(item.text, 'MATH candidate'))
}

// F. COMPUTATIONAL QUESTION
{
  const result = generateQuestions({
    field: 'Computer Science',
    broadInterest: 'neural networks',
    phenomenon: 'classification robustness when lighting changes',
    factor: 'data augmentation strategy',
    outcome: 'accuracy under lighting shift',
    context: 'a public image classification benchmark',
    comparison: 'no augmentation vs. lighting-focused augmentation',
    evidenceSource: 'benchmark dataset',
    evidenceAccess: 'I know where to get it',
    methodType: 'classify',
    timeAvailable: '1–2 months',
    smallestVersion: 'evaluate one model family on one lighting-shift split',
  })
  assert(result.candidates.some((item) => item.id === 'method' || item.id === 'comparison' || item.id === 'relationship'), 'COMPUTATIONAL: expected method/comparison/relationship candidates')
  assert(result.diagnostics.dimensions.find((item) => item.id === 'evidence').score >= 1, 'COMPUTATIONAL: evidence should score')
}

// G. MISSING EVIDENCE
{
  const result = generateQuestions({
    field: 'Biology',
    broadInterest: 'antibiotic resistance',
    phenomenon: 'growth response under graded antibiotic exposure',
    factor: 'antibiotic concentration',
    outcome: 'growth rate',
    context: 'one laboratory strain under controlled culture conditions',
    evidenceAccess: 'I do not know yet',
  })
  assert(result.diagnostics.dimensions.find((item) => item.id === 'evidence').score <= 1, 'MISSING EVIDENCE: evidence score should be weak')
  assert(result.diagnostics.warnings.some((item) => /verify that evidence/i.test(item)), 'MISSING EVIDENCE: should warn about unknown access')
  assert(result.diagnostics.missingPieces.some((item) => /Evidence source/i.test(item)), 'MISSING EVIDENCE: missing pieces should mention evidence')
}

// H. TOO-BROAD TOPIC
{
  const result = generateQuestions({ broadInterest: 'AI' })
  assert(result.diagnostics.warnings.some((item) => /area of interest|concrete phenomenon/i.test(item)), 'TOO-BROAD: should warn')
  const climate = generateQuestions({ broadInterest: 'climate change' })
  assert(climate.diagnostics.warnings.length > 0, 'TOO-BROAD climate: should warn')
}

// I. SATURN EXAMPLE
{
  const saturn = BUILDER_EXAMPLES.find((item) => item.id === 'saturn')
  const result = generateQuestions(saturn.state)
  assertIncludes(result.primary.text, 'radial sampling resolution', 'SATURN: primary should mention factor')
  assertIncludes(result.primary.text, 'detected peak structure', 'SATURN: primary should mention outcome')
  assertIncludes(result.primary.text, 'Cassini', 'SATURN: primary should mention context')
  assert(['DRAFT TAKING SHAPE', 'STRUCTURALLY COMPLETE'].includes(result.diagnostics.overallStatus), 'SATURN: should be taking shape or complete')
  const record = buildResearchRecord(saturn.state)
  assertIncludes(record.text, 'RESEARCH QUESTION DRAFT', 'SATURN: record header')
  assertIncludes(record.text, 'Candidate questions:', 'SATURN: record candidates')
}

// K. BUNDLED EXAMPLES AND DISCIPLINE LENSES
for (const example of BUILDER_EXAMPLES) {
  const result = generateQuestions(example.state)
  assert(result.primary?.text, `EXAMPLE ${example.id}: should generate a primary question`)
  assert(result.state.field === example.field, `EXAMPLE ${example.id}: should use its natural discipline`)
  result.candidates.forEach((item) => assertNoBrokenSlots(item.text, `EXAMPLE ${example.id}`))
}
for (const [field, preset] of Object.entries(FIELD_PRESETS)) {
  assert(preset.methods.length > 0, `LENS ${field}: methods missing`)
  assert(preset.phenomenonExamples.length > 0, `LENS ${field}: examples missing`)
}

// L. RELATION TYPE VALUES AND EXACT STATUSES
assert(
  RELATION_TYPES.map((item) => item.value).join('|')
    === 'controlled-change|association|comparison|mechanism|prediction-estimation|mathematical-structure',
  'RELATION TYPES: requested values changed',
)
const allowedStatuses = new Set(['START HERE', 'STRUCTURE INCOMPLETE', 'DRAFT TAKING SHAPE', 'STRUCTURALLY COMPLETE'])
for (const example of BUILDER_EXAMPLES) {
  assert(allowedStatuses.has(generateQuestions(example.state).statusLabel), `STATUS ${example.id}: unexpected label`)
}

// J. MALFORMED / WHITESPACE INPUT
{
  const result = generateQuestions({
    broadInterest: '   graph theory   ',
    phenomenon: '\n\nextremal behavior of a graph invariant\t',
    factor: '  maximum degree ',
    outcome: 'extremal value of the invariant',
    context: '   connected graphs with a bounded number of vertices ',
    methodType: 'prove',
    field: 'Mathematics',
    evidenceSource: 'proof / mathematical derivation',
    evidenceAccess: 'I know where to get it',
    smallestVersion: 'test small n computationally, identify a pattern, then attempt a proof',
    timeAvailable: '1–2 months',
  })
  assert(!/\s{2,}/.test(result.primary.text), 'MALFORMED: primary should not keep double spaces')
  assertNoBrokenSlots(result.primary.text, 'MALFORMED primary')
  assert(result.state.broadInterest === 'graph theory', 'MALFORMED: interest should be trimmed')
}

if (errors.length > 0) {
  console.error('Question builder validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log('Question builder validation passed for empty, partial, relationship, comparison, mathematics, computational, missing-evidence, too-broad, Saturn, and malformed cases.')
}

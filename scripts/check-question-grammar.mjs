import { assessPhraseStructure, evaluateDiagnostics } from '../src/utils/questionDiagnostics.js'
import { generateQuestions } from '../src/utils/questionGenerator.js'

const errors = []
const assert = (condition, message) => { if (!condition) errors.push(message) }

const base = {
  field: 'Computer Science',
  broadInterest: 'image analysis',
  phenomenon: 'robust recognition under lighting shift',
  factor: 'preprocessing strategy',
  outcome: 'classification accuracy',
  context: 'CIFAR-10 images with n <= 20 lighting variants',
  comparison: 'raw images and normalized images',
  evidenceSource: 'CIFAR-10 benchmark samples',
  evidenceAccess: 'I know where to get it',
  timeAvailable: '2–4 weeks',
  smallestVersion: 'compare one baseline on 20 held-out images',
}

const expected = {
  estimate: /estimated from/,
  classify: /classified using/,
  reconstruct: /reconstructed from/,
  compare: /differ between/,
  simulate: /simulated/,
  analyze: /patterns.*emerge/,
  model: /model.*explain/,
  measure: /measured.*vary/,
  test: /Does changing/,
  compute: /What is/,
  prove: /Under what conditions|extremal|recurrence/,
}

for (const [methodType, grammar] of Object.entries(expected)) {
  const state = methodType === 'prove'
    ? { ...base, field: 'Mathematics', broadInterest: 'graph theory', phenomenon: 'an extremal graph invariant' }
    : { ...base, methodType }
  state.methodType = methodType
  const candidate = generateQuestions(state).candidates.find((item) =>
    item.id === 'method'
      || methodType === 'compare' && item.id === 'comparison'
      || methodType === 'prove' && item.id === 'mathematical',
  )
  assert(candidate && grammar.test(candidate.text), `${methodType}: method-specific grammar missing`)
  assert(!/estimate, reconstruct, classify, or analyze/i.test(candidate?.text || ''), `${methodType}: generic verb chain found`)
  assert(!/FIRST-DRAFT QUESTION/.test(candidate?.text || ''), `${methodType}: forbidden generated prefix`)
}

for (const [relationType, fragment] of [
  ['controlled-change', /changing.*affect/],
  ['association', /associated with/],
  ['comparison', /differ between/],
  ['mechanism', /mechanism.*influence/],
  ['prediction-estimation', /predicted from/],
  ['mathematical-structure', /conditions|extremal|recurrence/],
]) {
  const state = relationType === 'mathematical-structure'
    ? { ...base, field: 'Mathematics', broadInterest: 'graph theory', relationType }
    : { ...base, relationType }
  assert(fragment.test(generateQuestions(state).primary?.text || ''), `${relationType}: relation grammar missing`)
}

const association = generateQuestions({ ...base, relationType: 'association' }).primary.text
assert(!/\bcaus(?:e|es|ed|al)|\baffect\b|\bproduce\b/i.test(association), 'association: causal language leaked into non-causal grammar')

for (const phrase of ['CIFAR-10', 'n <= 20', "psi''", 'O(n log n)', 'RSS_2010_170', 'K_5', 'x^2+y^2', 'f(n)']) {
  assert(assessPhraseStructure(phrase) === 'plausible', `notation rejected: ${phrase}`)
}
for (const phrase of ['', 'stuff', 'asdfghjkl', 'dasdasdsdaddasdsad', 'fdfafasfafas', 'asdfasdfasdf', 'dadas', 'sodas']) {
  assert(assessPhraseStructure(phrase) !== 'plausible', `weak phrase accepted: ${phrase || '(empty)'}`)
}

const scopeBase = { ...base, smallestVersion: 'compare one baseline on 20 images' }
assert(evaluateDiagnostics(scopeBase).dimensions.find((item) => item.id === 'scope').score === 2, 'scope: bounded action should be strong')
assert(evaluateDiagnostics({ mainConstraint: 'random constraint' }).dimensions.find((item) => item.id === 'scope').score === 0, 'scope: random constraint must not upgrade scope')
assert(evaluateDiagnostics({ mainConstraint: 'sodas' }).dimensions.find((item) => item.id === 'scope').score === 0, 'scope: weak constraint must not upgrade scope')
assert(evaluateDiagnostics({ ...scopeBase, context: '' }).dimensions.find((item) => item.id === 'scope').score < 2, 'scope: context is required')
assert(evaluateDiagnostics({ ...scopeBase, timeAvailable: '' }).dimensions.find((item) => item.id === 'scope').score < 2, 'scope: time is required')
assert(evaluateDiagnostics({ ...scopeBase, smallestVersion: 'something' }).dimensions.find((item) => item.id === 'scope').score < 2, 'scope: real action is required')
assert(evaluateDiagnostics({ ...scopeBase, smallestVersion: 'dasdasdsdaddasdsad' }).dimensions.find((item) => item.id === 'scope').score < 2, 'scope: repetitive gibberish must not be strong')

const placeholderState = {
  ...scopeBase,
  phenomenon: 'dasdasdsdaddasdsad',
  outcome: 'dasdasdsdaddasdsad',
  evidenceSource: 'dasdasdsdaddasdsad',
  smallestVersion: 'dasdasdsdaddasdsad',
}
assert(evaluateDiagnostics(placeholderState).overallStatus === 'STRUCTURE INCOMPLETE', 'placeholder-like critical input must remain structurally incomplete')
for (const dimension of evaluateDiagnostics({
  ...placeholderState,
  factor: 'fdfafasfafas',
  comparison: 'dadas',
  context: 'sodas',
}).dimensions) {
  assert(dimension.score < 2, `placeholder diagnostics: ${dimension.label} must not be Strong`)
}

if (errors.length) {
  console.error('Question grammar validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log('Question grammar validation passed.')
}

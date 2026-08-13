import { evaluateDiagnostics, cleanText, hasText, isMathematicalMode } from './questionDiagnostics.js'

function slot(value, fallback) {
  const text = cleanText(value)
  return text || fallback
}

function completeRelation(state) {
  return hasText(state.factor) && hasText(state.outcome) && hasText(state.context)
}

function mathematicalQuestion(state) {
  const phenomenon = cleanText(state.phenomenon)
  const context = cleanText(state.context)
  const factor = slot(state.factor, 'the defining parameter')
  const outcome = slot(state.outcome, 'the target property')
  const subject = `${state.broadInterest} ${phenomenon}`.toLowerCase()
  if (/graph|network/.test(subject)) {
    return `Under what conditions in ${context} does ${outcome} depend on ${factor}, and which extremal graph structures attain the bound?`
  }
  if (/combin|count|path|sequence|recurrence/.test(subject)) {
    return `For ${context}, what recurrence or closed form describes ${outcome} as ${factor} varies?`
  }
  if (/number|integer|prime|diophantine/.test(subject)) {
    return `Under what conditions on ${factor} does ${phenomenon} have ${outcome} in ${context}?`
  }
  return `Under what conditions does ${phenomenon} exhibit ${outcome} in ${context}, and how does the structure change as ${factor} varies?`
}

function methodQuestion(state) {
  const method = cleanText(state.methodType).toLowerCase()
  const factor = cleanText(state.factor)
  const outcome = cleanText(state.outcome)
  const context = cleanText(state.context)
  const evidence = slot(state.evidenceSource, 'the identified evidence')
  const comparison = cleanText(state.comparison)
  const phenomenon = slot(state.phenomenon, outcome)
  const grammars = {
    estimate: () => `How accurately can ${outcome} be estimated from ${evidence} in ${context}?`,
    classify: () => `How accurately can ${outcome} be classified using ${evidence} in ${context}?`,
    reconstruct: () => `How accurately can ${outcome} be reconstructed from ${evidence} in ${context}?`,
    compare: () => comparison
      ? `How does ${outcome} differ between ${comparison} in ${context}?`
      : `How does ${outcome} change across levels of ${factor} in ${context}?`,
    simulate: () => `How does simulated ${factor} change ${outcome} in ${context}?`,
    analyze: () => `What patterns in ${outcome} emerge from analysis of ${evidence} in ${context}?`,
    model: () => `How well can a model using ${factor} explain ${outcome} in ${context}?`,
    measure: () => `How does measured ${outcome} vary with ${factor} in ${context}?`,
    test: () => `Does changing ${factor} produce a detectable change in ${outcome} in ${context}?`,
    compute: () => `What is ${outcome} for ${phenomenon} in ${context}, and how does it vary with ${factor}?`,
    prove: () => mathematicalQuestion(state),
  }
  return grammars[method]?.() || ''
}

function relationQuestion(state) {
  const factor = cleanText(state.factor)
  const outcome = cleanText(state.outcome)
  const context = cleanText(state.context)
  const comparison = cleanText(state.comparison)
  switch (state.relationType) {
    case 'association':
      return completeRelation(state) ? `How is ${factor} associated with ${outcome} in ${context}?` : ''
    case 'comparison':
      return outcome && comparison && context ? `How does ${outcome} differ between ${comparison} in ${context}?` : ''
    case 'mechanism':
      return completeRelation(state) ? `Through what mechanism might ${factor} influence ${outcome} in ${context}?` : ''
    case 'prediction-estimation':
      return outcome && context && state.evidenceSource
        ? `How accurately can ${outcome} be predicted from ${cleanText(state.evidenceSource)} in ${context}?`
        : ''
    case 'mathematical-structure':
      return state.phenomenon && context ? mathematicalQuestion(state) : ''
    case 'controlled-change':
      return completeRelation(state) ? `How does changing ${factor} affect ${outcome} in ${context}?` : ''
    default:
      return completeRelation(state) ? `How is ${factor} associated with ${outcome} in ${context}?` : ''
  }
}

function buildCandidates(state) {
  const candidates = []
  const mathMode = isMathematicalMode(state) || state.relationType === 'mathematical-structure'
  const relation = mathMode && !state.relationType ? mathematicalQuestion(state) : relationQuestion(state)
  const relationId = mathMode ? 'mathematical' : state.relationType || 'relationship'
  const method = hasText(state.methodType) && hasText(state.outcome) && hasText(state.context)
    ? methodQuestion(state)
    : ''

  if (relation) candidates.push({ type: 'Recommended structure', id: relationId, text: relation })
  if (state.comparison && state.outcome && state.context) {
    const comparison = `How does ${state.outcome} differ between ${state.comparison} in ${state.context}?`
    if (!candidates.some((item) => item.text === comparison)) {
      candidates.push({ type: 'Comparison', id: 'comparison', text: comparison })
    }
  }
  if (method && method !== relation && !candidates.some((item) => item.text === method)) {
    candidates.push({ type: `${state.methodType} method`, id: 'method', text: method })
  }
  if (mathMode && state.phenomenon && state.context) {
    const math = mathematicalQuestion(state)
    if (!candidates.some((item) => item.text === math)) {
      candidates.push({ type: 'Mathematical structure', id: 'mathematical', text: math })
    }
  }
  if (completeRelation(state)) {
    const association = `How is ${state.factor} associated with ${state.outcome} in ${state.context}?`
    if (!candidates.some((item) => item.text === association)) {
      candidates.push({ type: 'Association', id: 'association', text: association })
    }
  }

  if (candidates.length === 0) {
    if (hasText(state.broadInterest) && !hasText(state.phenomenon)) {
      candidates.push({ type: 'Coach prompt', id: 'draft-interest', text: `What concrete phenomenon inside ${state.broadInterest} do you want to understand?`, incomplete: true })
    } else if (hasText(state.phenomenon)) {
      candidates.push({ type: 'Coach prompt', id: 'draft-phenomenon', text: `What bounded setting would let you investigate ${state.phenomenon}?`, incomplete: true })
    }
  }
  return candidates.slice(0, 3)
}

function draftStatus(diagnostics) {
  return diagnostics.overallStatus
}

export function generateQuestions(rawState = {}) {
  const state = {
    field: cleanText(rawState.field),
    relationType: cleanText(rawState.relationType),
    broadInterest: cleanText(rawState.broadInterest),
    phenomenon: cleanText(rawState.phenomenon),
    factor: cleanText(rawState.factor),
    outcome: cleanText(rawState.outcome),
    context: cleanText(rawState.context),
    comparison: cleanText(rawState.comparison),
    evidenceSource: cleanText(rawState.evidenceSource),
    evidenceAccess: cleanText(rawState.evidenceAccess),
    methodType: cleanText(rawState.methodType),
    timeAvailable: cleanText(rawState.timeAvailable),
    smallestVersion: cleanText(rawState.smallestVersion),
    mainConstraint: cleanText(rawState.mainConstraint),
  }

  const diagnostics = evaluateDiagnostics(state)
  const candidates = buildCandidates(state)
  const primary = candidates[0] || null

  return {
    state,
    diagnostics,
    candidates,
    primary,
    statusLabel: draftStatus(diagnostics),
    questionType: primary?.type || 'Not yet formed',
    nextImprovement: diagnostics.mostImportantNext,
  }
}

export function buildResearchRecord(rawState = {}) {
  const generated = generateQuestions(rawState)
  const { state, diagnostics, candidates } = generated
  const lines = [
    'RESEARCH QUESTION DRAFT',
    '',
    `Field: ${state.field || '—'}`,
    `Interest: ${state.broadInterest || '—'}`,
    `Phenomenon: ${state.phenomenon || '—'}`,
    `Factor: ${state.factor || '—'}`,
    `Outcome: ${state.outcome || '—'}`,
    `Context: ${state.context || '—'}`,
    `Comparison: ${state.comparison || '—'}`,
    `Evidence: ${state.evidenceSource || '—'}`,
    `Evidence access: ${state.evidenceAccess || '—'}`,
    `Method: ${state.methodType || '—'}`,
    `Time available: ${state.timeAvailable || '—'}`,
    `Smallest feasible version: ${state.smallestVersion || '—'}`,
    `Main constraint: ${state.mainConstraint || '—'}`,
    '',
    'Candidate questions:',
  ]

  if (candidates.length === 0) {
    lines.push('1. (none yet)')
  } else {
    candidates.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.text}`)
    })
  }

  lines.push('')
  lines.push(`Current first-draft diagnostic: ${diagnostics.overallStatus}`)
  lines.push(`Diagnostic detail: ${diagnostics.dimensions.map((d) => `${d.label}=${d.status}`).join('; ')}`)
  lines.push(`Most important next action: ${diagnostics.mostImportantNext}`)

  return {
    text: lines.join('\n'),
    generated,
  }
}

export function logicNodeStates(rawState = {}) {
  const generated = generateQuestions(rawState)
  const state = generated.state
  const mathMode = isMathematicalMode(state)
  return {
    interest: hasText(state.broadInterest),
    phenomenon: hasText(state.phenomenon),
    factor: hasText(state.factor) || (mathMode && hasText(state.phenomenon)),
    outcome: hasText(state.outcome) || (mathMode && hasText(state.phenomenon)),
    context: hasText(state.context),
    evidence: hasText(state.evidenceSource) && state.evidenceAccess !== 'I do not know yet',
    evidencePartial: hasText(state.evidenceSource) || hasText(state.evidenceAccess),
    question: Boolean(
      generated.primary
      && !generated.primary.incomplete
      && ['DRAFT TAKING SHAPE', 'STRUCTURALLY COMPLETE'].includes(
        generated.diagnostics.overallStatus,
      )
    ),
  }
}

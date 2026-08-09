import { evaluateDiagnostics, cleanText, hasText, isMathematicalMode } from './questionDiagnostics.js'

function slot(value, fallback) {
  const text = cleanText(value)
  return text || fallback
}

function canBuildRelationship(state) {
  return hasText(state.factor) && hasText(state.outcome) && hasText(state.context)
}

function canBuildComparison(state) {
  return hasText(state.outcome) && hasText(state.comparison) && hasText(state.context)
}

function canBuildAssociation(state) {
  return hasText(state.factor) && hasText(state.outcome) && hasText(state.context)
}

function canBuildMechanism(state) {
  return hasText(state.factor) && hasText(state.outcome) && hasText(state.context)
}

function canBuildMethod(state) {
  return (
    hasText(state.methodType)
    && hasText(state.outcome)
    && (hasText(state.evidenceSource) || hasText(state.context))
  )
}

function canBuildMathematical(state) {
  return (
    isMathematicalMode(state)
    && hasText(state.phenomenon)
    && hasText(state.context)
  )
}

function buildCandidates(state) {
  const candidates = []
  const factor = cleanText(state.factor)
  const outcome = cleanText(state.outcome)
  const context = cleanText(state.context)
  const comparison = cleanText(state.comparison)
  const evidence = cleanText(state.evidenceSource)
  const method = cleanText(state.methodType)
  const phenomenon = cleanText(state.phenomenon)
  const mathMode = isMathematicalMode(state)

  if (canBuildRelationship(state)) {
    candidates.push({
      type: 'Relationship',
      id: 'relationship',
      text: `How does ${factor} affect ${outcome} in ${context}?`,
    })
  }

  if (canBuildComparison(state)) {
    candidates.push({
      type: 'Comparison',
      id: 'comparison',
      text: `How does ${outcome} differ between ${comparison} in ${context}?`,
    })
  }

  if (canBuildAssociation(state) && method !== 'prove') {
    candidates.push({
      type: 'Association',
      id: 'association',
      text: `How is ${factor} associated with ${outcome} in ${context}?`,
    })
  }

  if (canBuildMechanism(state) && (method === 'analyze' || method === 'model' || !method || method === 'test')) {
    candidates.push({
      type: 'Mechanism',
      id: 'mechanism',
      text: `Through what mechanism might ${factor} influence ${outcome} in ${context}?`,
    })
  }

  if (canBuildMethod(state)) {
    const evidencePhrase = evidence || 'available evidence'
    const contextPhrase = context || 'the chosen setting'
    candidates.push({
      type: 'Method / Computational',
      id: 'method',
      text: `How accurately or efficiently can ${method} estimate, reconstruct, classify, or analyze ${outcome} using ${evidencePhrase} in ${contextPhrase}?`,
    })
  }

  if (canBuildMathematical(state)) {
    const varied = factor || 'a key assumption or parameter'
    candidates.push({
      type: 'Mathematical',
      id: 'mathematical',
      text: `Under what conditions does ${phenomenon} hold in ${context}, and what changes when ${varied} is varied?`,
    })
  }

  // Lightweight partial drafts when full candidates are not yet possible
  if (candidates.length === 0) {
    if (hasText(state.broadInterest) && !hasText(state.phenomenon)) {
      candidates.push({
        type: 'Draft',
        id: 'draft-interest',
        text: `What concrete phenomenon inside ${cleanText(state.broadInterest)} do you want to understand?`,
        incomplete: true,
      })
    } else if (hasText(state.phenomenon) && !hasText(state.context)) {
      candidates.push({
        type: 'Draft',
        id: 'draft-phenomenon',
        text: `What specific aspect of ${phenomenon} can be studied in a bounded setting?`,
        incomplete: true,
      })
    } else if (hasText(state.phenomenon) && hasText(state.factor) && !hasText(state.outcome)) {
      candidates.push({
        type: 'Draft',
        id: 'draft-factor',
        text: `How might ${factor} relate to an observable outcome in ${slot(context, 'a bounded setting')}?`,
        incomplete: true,
      })
    } else if (mathMode && hasText(state.phenomenon)) {
      candidates.push({
        type: 'Draft',
        id: 'draft-math',
        text: `Under what conditions does ${phenomenon}${context ? ` hold in ${context}` : ''}?`,
        incomplete: true,
      })
    }
  }

  // Deterministic ranking / selection: prefer complete structures, field-aware
  const preferredOrder = (() => {
    if (mathMode || state.field === 'Mathematics') {
      return ['mathematical', 'comparison', 'relationship', 'method', 'association', 'mechanism', 'draft-math', 'draft-phenomenon', 'draft-factor', 'draft-interest']
    }
    if (hasText(comparison) && hasText(outcome) && hasText(context)) {
      return ['comparison', 'relationship', 'association', 'method', 'mechanism', 'mathematical']
    }
    if (canBuildRelationship(state)) {
      return ['relationship', 'comparison', 'association', 'mechanism', 'method', 'mathematical']
    }
    if (['classify', 'reconstruct', 'estimate', 'simulate'].includes(method)) {
      return ['method', 'comparison', 'relationship', 'association', 'mechanism', 'mathematical']
    }
    if (method === 'analyze' || method === 'model') {
      return ['mechanism', 'relationship', 'association', 'method', 'comparison', 'mathematical']
    }
    return ['relationship', 'comparison', 'association', 'mechanism', 'method', 'mathematical']
  })()

  const unique = []
  const seen = new Set()
  for (const id of preferredOrder) {
    const match = candidates.find((item) => item.id === id)
    if (match && !seen.has(match.text)) {
      unique.push(match)
      seen.add(match.text)
    }
  }
  for (const item of candidates) {
    if (!seen.has(item.text)) {
      unique.push(item)
      seen.add(item.text)
    }
  }

  const complete = unique.filter((item) => !item.incomplete)
  const incomplete = unique.filter((item) => item.incomplete)
  return [...complete.slice(0, 4), ...incomplete.slice(0, Math.max(0, 2 - complete.length))].slice(0, 4)
}

function draftStatus(diagnostics, candidates) {
  const primary = candidates[0]
  if (!primary || primary.incomplete) return 'EMPTY DRAFT'
  if (diagnostics.overallStatus === 'Ready for a first test') return 'FIRST-DRAFT QUESTION'
  if (diagnostics.overallStatus === 'Developing') return 'DRAFT QUESTION'
  return 'EMERGING DRAFT'
}

export function generateQuestions(rawState = {}) {
  const state = {
    field: cleanText(rawState.field),
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
    statusLabel: draftStatus(diagnostics, candidates),
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
    question: Boolean(generated.primary && !generated.primary.incomplete),
  }
}

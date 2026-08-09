import { BROAD_TOPIC_TERMS } from '../data/questionBuilderPresets.js'

const STATUS_LABELS = {
  0: 'Needs definition',
  1: 'Developing',
  2: 'Ready for a first test',
}

const GENERIC_CONTEXT_PATTERNS = [
  /^the world$/i,
  /^society$/i,
  /^people$/i,
  /^humans$/i,
  /^nature$/i,
  /^everything$/i,
  /^general$/i,
  /^in general$/i,
  /^everywhere$/i,
  /^life$/i,
  /^science$/i,
  /^research$/i,
]

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function hasText(value) {
  return clean(value).length > 0
}

function isMeaningfulPhrase(value, minWords = 3) {
  const text = clean(value)
  if (!text) return false
  const words = text.split(/\s+/).filter(Boolean)
  return words.length >= minWords || text.length >= 18
}

function isBroadTopicOnly(interest) {
  const text = clean(interest).toLowerCase()
  if (!text) return false
  return BROAD_TOPIC_TERMS.includes(text)
}

function isGenericContext(context) {
  const text = clean(context)
  if (!text) return false
  if (GENERIC_CONTEXT_PATTERNS.some((pattern) => pattern.test(text))) return true
  const words = text.split(/\s+/).filter(Boolean)
  return words.length <= 2 && !/\d|dataset|graph|profile|student|city|window|bounded|n\b/i.test(text)
}

function isMathematicalMode(state) {
  const field = clean(state.field)
  const method = clean(state.methodType).toLowerCase()
  const evidence = clean(state.evidenceSource).toLowerCase()
  return (
    field === 'Mathematics'
    || ['prove', 'compute', 'classify'].includes(method)
    || /proof|derivation|counterexample|theorem|computation/.test(evidence)
  )
}

function scoreSpecificity(state) {
  const phenomenon = hasText(state.phenomenon)
  const context = hasText(state.context)
  const factorOrStructure = hasText(state.factor) || isMathematicalMode(state)
  let score = 0
  if (phenomenon) score += 1
  if (phenomenon && (context || factorOrStructure)) score += 1
  if (score === 2 && (!context || !isMeaningfulPhrase(state.phenomenon, 2))) {
    score = 1
  }
  return score
}

function scoreMeasurability(state) {
  if (hasText(state.outcome)) {
    return isMeaningfulPhrase(state.outcome, 2) ? 2 : 1
  }
  if (isMathematicalMode(state) && (hasText(state.phenomenon) || hasText(state.factor))) {
    return hasText(state.phenomenon) ? 2 : 1
  }
  return 0
}

function scoreEvidence(state) {
  const source = hasText(state.evidenceSource)
  const access = clean(state.evidenceAccess)
  if (!source && !access) return 0
  if (!source) return 1
  if (access === 'I do not know yet' || !access) return 1
  if (access === 'I think it exists') return 1
  return 2
}

function scoreScope(state) {
  const smallest = hasText(state.smallestVersion)
  const meaningfulSmallest = isMeaningfulPhrase(state.smallestVersion, 4)
  const boundedContext = hasText(state.context) && !isGenericContext(state.context)
  const time = hasText(state.timeAvailable)
  let score = 0
  if (smallest) score += 1
  if (meaningfulSmallest && (boundedContext || time)) score += 1
  return score
}

function scoreComparisonStructure(state) {
  if (hasText(state.comparison)) return 2
  if (isMathematicalMode(state) && hasText(state.phenomenon) && hasText(state.context)) {
    return 2
  }
  if (hasText(state.factor) && hasText(state.outcome)) return 1
  if (hasText(state.factor) || hasText(state.outcome)) return 1
  return 0
}

function scoreChallengeability(state) {
  if (hasText(state.outcome)) return isMeaningfulPhrase(state.outcome, 2) ? 2 : 1
  if (isMathematicalMode(state) && (hasText(state.phenomenon) || hasText(state.factor))) {
    return 2
  }
  if (hasText(state.methodType) && /metric|accuracy|runtime|frequency|rate|score/i.test(clean(state.outcome))) {
    return 2
  }
  return 0
}

function explainDimension(id, score, state) {
  const status = STATUS_LABELS[score]
  switch (id) {
    case 'specificity':
      if (score === 0) {
        return {
          status,
          reason: 'The interest is still broad; a concrete phenomenon has not been named.',
          next: 'Name one behavior, pattern, mechanism, object, or change inside the interest.',
        }
      }
      if (score === 1) {
        return {
          status,
          reason: 'You have a phenomenon starting point, but the system or varying structure is still thin.',
          next: 'Add a bounded context or the factor/assumption you want to vary.',
        }
      }
      return {
        status,
        reason: 'Phenomenon and supporting structure are specific enough for a first draft.',
        next: 'Keep the wording concrete; avoid drifting back into a whole field label.',
      }
    case 'measurability':
      if (score === 0) {
        return {
          status,
          reason: 'You have identified the phenomenon, but not what you would actually observe.',
          next: 'Name one quantity, property, pattern, metric, or outcome that could change.',
        }
      }
      if (score === 1) {
        return {
          status,
          reason: 'An outcome or target exists, but it still needs sharper definition.',
          next: 'Make the outcome something you can measure, prove, count, or classify.',
        }
      }
      return {
        status,
        reason: 'There is a clear observable target, metric, or mathematical property to inspect.',
        next: 'Write how you would recognize a change in that target.',
      }
    case 'evidence':
      if (score === 0) {
        return {
          status,
          reason: 'No evidence source has been identified yet.',
          next: 'Choose a dataset, proof route, simulation, experiment, or archive you could use.',
        }
      }
      if (score === 1) {
        return {
          status,
          reason: 'Evidence is partly identified, but access is still uncertain or incomplete.',
          next: 'Confirm where the evidence lives and whether a student can actually inspect it.',
        }
      }
      return {
        status,
        reason: 'An evidence source and a realistic access path are both identified.',
        next: 'Write one sentence about what part of that evidence you would inspect first.',
      }
    case 'scope':
      if (score === 0) {
        return {
          status,
          reason: 'The smallest feasible version of the project is not yet defined.',
          next: 'Describe the smallest version of the problem that could still teach you something.',
        }
      }
      if (score === 1) {
        return {
          status,
          reason: 'A small version exists, but the time window or bounded setting is incomplete.',
          next: 'Bound the system and choose a realistic amount of available time.',
        }
      }
      return {
        status,
        reason: 'Scope is bounded by a smallest version plus time or context constraints.',
        next: 'Protect that small version; expand only after it works.',
      }
    case 'comparisonStructure':
      if (score === 0) {
        return {
          status,
          reason: 'The question structure is still incomplete: little relation or comparison is defined.',
          next: 'Add a factor/outcome link, a comparison, or a mathematical structure to vary.',
        }
      }
      if (score === 1) {
        return {
          status,
          reason: 'A relationship is forming, but comparison or structure could be sharper.',
          next: 'Add a baseline, comparison group, or the assumption you will vary.',
        }
      }
      if (isMathematicalMode(state) && !hasText(state.comparison)) {
        return {
          status,
          reason: 'Mathematical structure can carry the question without an external comparison group.',
          next: 'State what changes when an assumption or parameter is varied.',
        }
      }
      return {
        status,
        reason: 'The question has a usable comparison, mechanism link, or mathematical structure.',
        next: 'Keep the structure explicit in the final wording.',
      }
    case 'challengeability':
      if (score === 0) {
        return {
          status,
          reason: 'Nothing yet could clearly succeed or fail against evidence.',
          next: 'Name an observable outcome, metric, or proof/counterexample target.',
        }
      }
      if (score === 1) {
        return {
          status,
          reason: 'A challengeable target is emerging, but it is still easy to interpret vaguely.',
          next: 'Specify what result would surprise you or force a revision.',
        }
      }
      return {
        status,
        reason: 'The draft can be challenged by measurement, comparison, computation, or proof.',
        next: 'Write one sentence describing what would count as a failed expectation.',
      }
    default:
      return { status, reason: '', next: '' }
  }
}

export function evaluateDiagnostics(rawState = {}) {
  const state = {
    field: clean(rawState.field),
    broadInterest: clean(rawState.broadInterest),
    phenomenon: clean(rawState.phenomenon),
    factor: clean(rawState.factor),
    outcome: clean(rawState.outcome),
    context: clean(rawState.context),
    comparison: clean(rawState.comparison),
    evidenceSource: clean(rawState.evidenceSource),
    evidenceAccess: clean(rawState.evidenceAccess),
    methodType: clean(rawState.methodType),
    timeAvailable: clean(rawState.timeAvailable),
    smallestVersion: clean(rawState.smallestVersion),
    mainConstraint: clean(rawState.mainConstraint),
  }

  const dimensions = [
    { id: 'specificity', label: 'Specificity', score: scoreSpecificity(state) },
    { id: 'measurability', label: 'Measurability', score: scoreMeasurability(state) },
    { id: 'evidence', label: 'Evidence', score: scoreEvidence(state) },
    { id: 'scope', label: 'Scope', score: scoreScope(state) },
    { id: 'comparisonStructure', label: 'Comparison / Structure', score: scoreComparisonStructure(state) },
    { id: 'challengeability', label: 'Falsifiability / Challengeability', score: scoreChallengeability(state) },
  ].map((dimension) => ({
    ...dimension,
    ...explainDimension(dimension.id, dimension.score, state),
  }))

  const warnings = []
  if (
    hasText(state.broadInterest)
    && !hasText(state.phenomenon)
    && !hasText(state.context)
    && !hasText(state.factor)
  ) {
    warnings.push('This is still an area of interest, not yet a research question.')
  }
  if (isBroadTopicOnly(state.broadInterest) && !hasText(state.phenomenon)) {
    warnings.push('This topic needs a concrete phenomenon before it can become a research question.')
  }
  if (isGenericContext(state.context)) {
    warnings.push('Try bounding the system, dataset, population, theorem family, or time window.')
  }
  if (state.evidenceAccess === 'I do not know yet') {
    warnings.push('Before expanding the idea, verify that evidence actually exists.')
  }
  if (
    (state.timeAvailable === '1–2 months' || state.timeAvailable === 'A semester')
    && !hasText(state.smallestVersion)
  ) {
    warnings.push('The project may be too large. Define the smallest version that could fail.')
  }
  if (hasText(state.broadInterest) && isBroadTopicOnly(state.broadInterest) && hasText(state.phenomenon) && !hasText(state.context)) {
    warnings.push('You named a phenomenon; next bound the setting where you will study it.')
  }

  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0]
  const total = dimensions.reduce((sum, item) => sum + item.score, 0)
  let overallStatus = 'Needs definition'
  if (total >= 9) overallStatus = 'Ready for a first test'
  else if (total >= 5) overallStatus = 'Developing'

  const missingPieces = []
  if (!hasText(state.phenomenon)) missingPieces.push('A concrete phenomenon is missing.')
  if (!hasText(state.outcome) && !isMathematicalMode(state)) missingPieces.push('An observable outcome or target is missing.')
  if (!hasText(state.context)) missingPieces.push('A bounded context is missing.')
  if (!hasText(state.evidenceSource)) missingPieces.push('Evidence source is not yet identified.')
  if (!hasText(state.smallestVersion)) missingPieces.push('The smallest feasible version is undefined.')

  return {
    dimensions,
    warnings,
    overallStatus,
    total,
    maxTotal: 12,
    weakest,
    mostImportantNext: weakest?.next || 'Add one concrete detail to the current stage.',
    missingPieces,
    mathematicalMode: isMathematicalMode(state),
  }
}

export function formatDiagnosticSummary(diagnostics) {
  return diagnostics.dimensions
    .map((dimension) => `${dimension.label}: ${dimension.status}`)
    .join('; ')
}

export { STATUS_LABELS, clean as cleanText, hasText, isMathematicalMode }

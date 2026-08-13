import { BROAD_TOPIC_TERMS } from '../data/questionBuilderPresets.js'

const STATUS_LABELS = {
  0: 'Missing',
  1: 'Developing',
  2: 'Strong',
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

const WEAK_PHRASES = /^(?:thing|things|stuff|something|anything|topic|research|project|question|good|bad|maybe|random|constraint|none|n\/a|idk|unknown|test|sodas)$/i
const ACTION_SIGNALS = /\b(?:analy[sz]e|compare|compute|count|derive|estimate|evaluate|examine|inspect|measure|model|observe|plot|prove|reconstruct|run|search|simulate|solve|test|track|validate|classify|collect|calculate|enumerate)\b/i

/**
 * Conservatively classify student-entered phrases. This deliberately accepts
 * identifiers and notation (CIFAR-10, psi'', n <= 20, O(n log n),
 * RSS_2010_170) rather than treating prose as the only legitimate structure.
 */
export function assessPhraseStructure(value) {
  const text = clean(value)
  if (!text) return 'empty'
  if (WEAK_PHRASES.test(text)) return 'weak'
  const alphabetic = text.replace(/[^a-z]/gi, '').toLowerCase()
  const uniqueLetters = new Set(alphabetic).size
  const repeatedChunk = /^(.{2,6})\1{2,}$/i.test(alphabetic)
    || /^(.{2,3})\1+.{0,1}$/i.test(alphabetic)
  const repetitiveAlphabetic = alphabetic.length >= 10 && uniqueLetters <= 4
  if (
    /^(.)\1{3,}$/i.test(text)
    || /^[a-z]{8,}$/i.test(text) && !/[aeiouy]/i.test(text)
    || repeatedChunk
    || repetitiveAlphabetic
  ) {
    return 'weak'
  }
  if (/(?:asdf|qwer|zxcv|lorem ipsum|blah|foo bar)/i.test(text)) return 'weak'
  if (!/[a-z0-9\u0370-\u03ff]/i.test(text)) return 'weak'
  return 'plausible'
}

function isMeaningfulPhrase(value, minWords = 3) {
  const text = clean(value)
  if (assessPhraseStructure(text) !== 'plausible') return false
  const words = text.split(/\s+/).filter(Boolean)
  return words.length >= minWords || text.length >= 12 || /[_<>=()'"\d]/.test(text)
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
    || ['prove', 'compute'].includes(method)
    || /proof|derivation|counterexample|theorem|computation/.test(evidence)
  )
}

function scoreSpecificity(state) {
  const phenomenonAssessment = assessPhraseStructure(state.phenomenon)
  const contextAssessment = assessPhraseStructure(state.context)
  const factorAssessment = assessPhraseStructure(state.factor)
  const phenomenon = phenomenonAssessment !== 'empty'
  const context = contextAssessment !== 'empty'
  const factorOrStructure = factorAssessment !== 'empty' || isMathematicalMode(state)
  let score = 0
  if (phenomenon) score += 1
  if (phenomenon && (context || factorOrStructure)) score += 1
  if (
    score === 2
    && (
      !context
      || phenomenonAssessment !== 'plausible'
      || contextAssessment !== 'plausible'
      || (hasText(state.factor) && factorAssessment !== 'plausible')
      || !isMeaningfulPhrase(state.phenomenon, 2)
    )
  ) {
    score = 1
  }
  return score
}

function scoreMeasurability(state) {
  if (hasText(state.outcome)) {
    return isMeaningfulPhrase(state.outcome, 2) ? 2 : 1
  }
  if (isMathematicalMode(state) && (hasText(state.phenomenon) || hasText(state.factor))) {
    return assessPhraseStructure(state.phenomenon) === 'plausible' ? 2 : 1
  }
  return 0
}

function scoreEvidence(state) {
  const sourceAssessment = assessPhraseStructure(state.evidenceSource)
  const source = sourceAssessment !== 'empty'
  const access = clean(state.evidenceAccess)
  if (!source && !access) return 0
  if (!source || sourceAssessment === 'weak') return 1
  if (access === 'I do not know yet' || !access) return 1
  if (access === 'I think it exists') return 1
  return 2
}

function scoreScope(state) {
  const smallestAssessment = assessPhraseStructure(state.smallestVersion)
  const meaningfulSmallest = smallestAssessment === 'plausible'
    && ACTION_SIGNALS.test(clean(state.smallestVersion))
  const boundedContext = assessPhraseStructure(state.context) === 'plausible'
    && !isGenericContext(state.context)
  const time = hasText(state.timeAvailable)
  if (meaningfulSmallest && boundedContext && time) return 2
  if (smallestAssessment !== 'empty' || boundedContext || time) return 1
  return 0
}

function scoreComparisonStructure(state) {
  if (hasText(state.comparison)) {
    return assessPhraseStructure(state.comparison) === 'plausible' ? 2 : 1
  }
  if (isMathematicalMode(state) && hasText(state.phenomenon) && hasText(state.context)) {
    return assessPhraseStructure(state.phenomenon) === 'plausible'
      && assessPhraseStructure(state.context) === 'plausible'
      ? 2
      : 1
  }
  if (
    hasText(state.factor)
    && hasText(state.outcome)
    && assessPhraseStructure(state.factor) === 'plausible'
    && assessPhraseStructure(state.outcome) === 'plausible'
  ) return 1
  if (hasText(state.factor) || hasText(state.outcome)) return 1
  return 0
}

function scoreChallengeability(state) {
  if (hasText(state.outcome)) return isMeaningfulPhrase(state.outcome, 2) ? 2 : 1
  if (isMathematicalMode(state) && (hasText(state.phenomenon) || hasText(state.factor))) {
    return assessPhraseStructure(state.phenomenon) === 'plausible'
      && (!hasText(state.factor) || assessPhraseStructure(state.factor) === 'plausible')
      ? 2
      : 1
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
          reason: 'Some scope information exists, but a bounded setting, time window, and plausible small action are not all present.',
          next: 'Name a real action for the smallest test, bound its setting, and choose an available time window.',
        }
      }
      return {
        status,
        reason: 'Scope includes a real smallest-test action, a bounded context, and an available time window.',
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
    relationType: clean(rawState.relationType),
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

  const criticalIds = ['specificity', 'evidence', 'scope', 'challengeability']
  const critical = dimensions.filter((item) => criticalIds.includes(item.id))
  const weakest = [...critical, ...dimensions.filter((item) => !criticalIds.includes(item.id))]
    .sort((a, b) => a.score - b.score)[0]
  const total = dimensions.reduce((sum, item) => sum + item.score, 0)
  const hasAnyInput = Object.values(state).some(hasText)
  const hasWeakCriticalInput = [
    state.phenomenon,
    state.evidenceSource,
    state.smallestVersion,
    isMathematicalMode(state) ? state.phenomenon : state.outcome,
  ].some((value) => hasText(value) && assessPhraseStructure(value) === 'weak')
  let overallStatus = 'START HERE'
  if (hasAnyInput) overallStatus = 'STRUCTURE INCOMPLETE'
  if (critical.every((item) => item.score >= 1)) overallStatus = 'DRAFT TAKING SHAPE'
  if (critical.every((item) => item.score === 2)) overallStatus = 'STRUCTURALLY COMPLETE'
  if (hasWeakCriticalInput) overallStatus = 'STRUCTURE INCOMPLETE'

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
    criticalIds,
  }
}

export function formatDiagnosticSummary(diagnostics) {
  return diagnostics.dimensions
    .map((dimension) => `${dimension.label}: ${dimension.status}`)
    .join('; ')
}

export { STATUS_LABELS, clean as cleanText, hasText, isMathematicalMode }

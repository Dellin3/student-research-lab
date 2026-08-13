import {
  EMPTY_NARROWING_STATE,
  NARROWING_HANDOFF_KEY,
  getLens,
  getLenses,
} from '../data/topicNarrowingPresets.js'

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function hasText(value) {
  return clean(value).length > 0
}

const DIRECTION_TEMPLATES = {
  Mathematics: {
    structure: (object, boundary) =>
      `Inspect the structure of ${object} within ${boundary}.`,
    extremal: (object, boundary) =>
      `Examine extremal behavior of ${object} within ${boundary}.`,
    classification: (object, boundary) =>
      `Classify ${object} into inspectable families within ${boundary}.`,
    existence: (object, boundary) =>
      `Determine whether ${object} exists, and under what conditions, inside ${boundary}.`,
    generalization: (object, boundary) =>
      `Test whether a pattern in ${object} extends beyond a small case inside ${boundary}.`,
    counterexample: (object, boundary) =>
      `Search for a counterexample to a claimed property of ${object} inside ${boundary}.`,
    parameter: (object, boundary) =>
      `Track how ${object} changes as one defining parameter varies inside ${boundary}.`,
  },
  'Computer Science': {
    algorithm: (object, boundary) =>
      `Compare one algorithm for ${object} inside ${boundary}.`,
    representation: (object, boundary) =>
      `Inspect how a chosen representation of ${object} behaves inside ${boundary}.`,
    dataset: (object, boundary) =>
      `Inspect ${object} on one dataset bounded as ${boundary}.`,
    benchmark: (object, boundary) =>
      `Run a fixed benchmark of ${object} inside ${boundary}.`,
    'failure-mode': (object, boundary) =>
      `Document a failure mode of ${object} inside ${boundary}.`,
    efficiency: (object, boundary) =>
      `Compare efficiency of ${object} inside ${boundary}.`,
    robustness: (object, boundary) =>
      `Test robustness of ${object} under a controlled change inside ${boundary}.`,
  },
  experimental: {
    measurement: (object, boundary) =>
      `Measure ${object} inside ${boundary}.`,
    comparison: (object, boundary) =>
      `Compare how ${object} differs across a small set of cases inside ${boundary}.`,
    mechanism: (object, boundary) =>
      `Probe a possible mechanism behind ${object} inside ${boundary}.`,
    parameter: (object, boundary) =>
      `Track ${object} as one parameter changes inside ${boundary}.`,
    environment: (object, boundary) =>
      `Inspect ${object} in one environmental setting: ${boundary}.`,
    scale: (object, boundary) =>
      `Inspect ${object} at one smaller scale inside ${boundary}.`,
  },
  'Social Science': {
    population: (object, boundary) =>
      `Study ${object} in one defined population: ${boundary}.`,
    behavior: (object, boundary) =>
      `Observe ${object} as a bounded behavior inside ${boundary}.`,
    operationalization: (object, boundary) =>
      `Operationalize ${object} as something that can be recorded inside ${boundary}.`,
    comparison: (object, boundary) =>
      `Compare ${object} across a small, named contrast inside ${boundary}.`,
    'time-place': (object, boundary) =>
      `Inspect ${object} in one time and place: ${boundary}.`,
    confounder: (object, boundary) =>
      `Name one confounder that may travel with ${object} inside ${boundary}.`,
  },
}

function templateGroup(discipline) {
  if (discipline === 'Mathematics') return DIRECTION_TEMPLATES.Mathematics
  if (discipline === 'Computer Science') return DIRECTION_TEMPLATES['Computer Science']
  if (discipline === 'Social Science') return DIRECTION_TEMPLATES['Social Science']
  return DIRECTION_TEMPLATES.experimental
}

export function nodeStates(state = {}) {
  return {
    interest: hasText(state.interest) ? 'defined' : 'waiting',
    object: hasText(state.object) ? 'defined' : hasText(state.interest) ? 'partial' : 'waiting',
    lens: hasText(state.lens) ? 'defined' : hasText(state.object) ? 'partial' : 'waiting',
    boundary: hasText(state.boundary) ? 'defined' : hasText(state.lens) ? 'partial' : 'waiting',
    direction: hasText(state.chosenDirectionId) || (hasText(state.object) && hasText(state.lens) && hasText(state.boundary))
      ? hasText(state.chosenDirectionId) ? 'defined' : 'partial'
      : 'waiting',
  }
}

export function currentCoach(state = {}, stageId = 'interest') {
  const interest = clean(state.interest) || 'this interest'
  switch (stageId) {
    case 'interest':
      return hasText(state.interest)
        ? 'A field name is a start. Next, name one object you could inspect separately.'
        : 'What keeps pulling your attention back? A field name is enough to begin.'
    case 'object':
      return hasText(state.object)
        ? 'You named an object. Next, choose a lens that could reveal something about it.'
        : `Choose one part of ${interest} that you could inspect separately.`
    case 'lens':
      return hasText(state.lens)
        ? 'The lens is a way of looking, not a result. Next, give the idea one inspectable boundary.'
        : 'What kind of investigation might reveal something? The useful options change with the discipline.'
    case 'boundary':
      return hasText(state.boundary)
        ? 'A boundary makes the idea inspectable. Next, look at the structural directions these choices generate.'
        : 'Give the direction one boundary: a dataset, system, population, condition, or small case.'
    case 'direction':
      return hasText(state.chosenDirectionId)
        ? 'This is a research direction, not yet a question. Question Builder is the next reasoning step.'
        : 'These are structural possibilities generated from your choices, not personalized recommendations. Choose one if it interests you.'
    default:
      return 'Name one concrete part of the idea you could inspect.'
  }
}

export function explainNarrowing(state = {}, directionText = '') {
  const interest = clean(state.interest) || 'the broad interest'
  const object = clean(state.object) || 'one object'
  const lens = getLens(state.discipline, state.lens)?.label || 'one lens'
  const boundary = clean(state.boundary) || 'one boundary'
  const direction = clean(directionText)
  return [
    `This is narrower than “${interest}” because it inspects one object (${object}) through a ${lens.toLowerCase()} lens inside one boundary (${boundary}).`,
    direction ? `The direction names work you could begin; it is not yet a testable or provable question.` : '',
  ].filter(Boolean).join(' ')
}

export function generateDirections(rawState = {}) {
  const state = {
    ...EMPTY_NARROWING_STATE,
    ...rawState,
    interest: clean(rawState.interest),
    object: clean(rawState.object),
    boundary: clean(rawState.boundary),
    discipline: clean(rawState.discipline),
    lens: clean(rawState.lens),
  }
  if (!state.object || !state.lens || !state.boundary || !state.discipline) return []

  const lenses = getLenses(state.discipline)
  const selected = lenses.find((item) => item.id === state.lens)
  if (!selected) return []

  const group = templateGroup(state.discipline)
  const alternatives = lenses.filter((item) => item.id !== selected.id).slice(0, 2)
  return [selected, ...alternatives].map((lens, index) => {
    const build = group[lens.id]
    const text = build
      ? build(state.object, state.boundary)
      : `Inspect ${state.object} through a ${lens.label.toLowerCase()} lens inside ${state.boundary}.`
    return {
      id: `${lens.id}-${index}`,
      lensId: lens.id,
      lensLabel: lens.label,
      text,
      source: index === 0 ? 'From your chosen lens' : 'Nearby structural possibility',
    }
  })
}

export function builderHandoffFromNarrowing(state = {}, directionText = '') {
  const discipline = clean(state.discipline)
  const mathematical = discipline === 'Mathematics'
  return {
    field: discipline,
    broadInterest: clean(state.interest),
    phenomenon: clean(state.object),
    context: clean(state.boundary),
    factor: getLens(discipline, state.lens)?.label || '',
    relationType: mathematical ? 'mathematical-structure' : 'association',
    methodType: mathematical ? 'prove' : '',
    narrowingDirection: clean(directionText),
  }
}

export function writeNarrowingHandoff(payload, storage = window.localStorage) {
  storage.setItem(NARROWING_HANDOFF_KEY, JSON.stringify(payload))
}

export function readNarrowingHandoff(storage = window.localStorage) {
  try {
    const raw = JSON.parse(storage.getItem(NARROWING_HANDOFF_KEY) || 'null')
    return raw && typeof raw === 'object' ? raw : null
  } catch {
    return null
  }
}

export function clearNarrowingHandoff(storage = window.localStorage) {
  storage.removeItem(NARROWING_HANDOFF_KEY)
}

export function isMathematicalDiscipline(discipline) {
  return clean(discipline) === 'Mathematics'
}

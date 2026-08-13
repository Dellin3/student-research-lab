export const NARROWING_STORAGE_KEY = 'researchStarterLab.topicNarrowing.v1'
export const NARROWING_HANDOFF_KEY = 'researchStarterLab.topicNarrowing.handoff.v1'

export const NARROWING_STAGES = [
  { id: 'interest', number: '01', label: 'Interest' },
  { id: 'object', number: '02', label: 'Object / phenomenon' },
  { id: 'lens', number: '03', label: 'Lens' },
  { id: 'boundary', number: '04', label: 'Boundary' },
  { id: 'direction', number: '05', label: 'First direction' },
]

export const EMPTY_NARROWING_STATE = {
  discipline: '',
  interest: '',
  object: '',
  lens: '',
  boundary: '',
  chosenDirectionId: '',
}

export const NARROWING_DISCIPLINES = [
  'Mathematics',
  'Physics',
  'Computer Science',
  'Biology',
  'Environmental Science',
  'Social Science',
]

const MATH_LENSES = [
  { id: 'structure', label: 'Structure', prompt: 'What structural feature could you inspect on its own?' },
  { id: 'extremal', label: 'Extremal case', prompt: 'What bound, maximum, or minimum might the object attain?' },
  { id: 'classification', label: 'Classification', prompt: 'What families or types could you separate the object into?' },
  { id: 'existence', label: 'Existence', prompt: 'What would it mean for such an object to exist or fail to exist?' },
  { id: 'generalization', label: 'Generalization', prompt: 'What smaller case might extend to a larger family?' },
  { id: 'counterexample', label: 'Counterexample', prompt: 'What claim about the object could a small example disprove?' },
  { id: 'parameter', label: 'Parameter change', prompt: 'Which parameter, if varied, would change the structure?' },
]

const CS_LENSES = [
  { id: 'algorithm', label: 'Algorithm', prompt: 'Which procedure or decision rule could you inspect?' },
  { id: 'representation', label: 'Representation', prompt: 'How is the object encoded, stored, or described?' },
  { id: 'dataset', label: 'Dataset', prompt: 'Which collection of examples would make the behavior visible?' },
  { id: 'benchmark', label: 'Benchmark', prompt: 'What comparison task could you run under a fixed protocol?' },
  { id: 'failure-mode', label: 'Failure mode', prompt: 'Where does the system break, degrade, or misbehave?' },
  { id: 'efficiency', label: 'Efficiency', prompt: 'What cost, runtime, or resource use could you compare?' },
  { id: 'robustness', label: 'Robustness', prompt: 'What perturbation would test whether the behavior holds?' },
]

const EXPERIMENTAL_LENSES = [
  { id: 'measurement', label: 'Measurement', prompt: 'What quantity could you record in a bounded setting?' },
  { id: 'comparison', label: 'Comparison', prompt: 'What two conditions, cases, or groups could you contrast?' },
  { id: 'mechanism', label: 'Mechanism', prompt: 'What process might connect one observable to another?' },
  { id: 'parameter', label: 'Parameter', prompt: 'Which controllable or observed parameter might matter?' },
  { id: 'environment', label: 'Environment', prompt: 'What setting, habitat, or physical context bounds the work?' },
  { id: 'scale', label: 'Scale', prompt: 'What smaller spatial, temporal, or sample scale is inspectable?' },
]

const SOCIAL_LENSES = [
  { id: 'population', label: 'Population', prompt: 'Whose experience, behavior, or response would you study?' },
  { id: 'behavior', label: 'Behavior', prompt: 'What action, choice, or reported experience is in view?' },
  { id: 'operationalization', label: 'Operationalization', prompt: 'How would you turn the idea into something you can record?' },
  { id: 'comparison', label: 'Comparison', prompt: 'What groups, times, or conditions could you contrast carefully?' },
  { id: 'time-place', label: 'Time / place', prompt: 'What bounded time window or place makes this inspectable?' },
  { id: 'confounder', label: 'Confounder', prompt: 'What else might move with the pattern you noticed?' },
]

export const LENSES_BY_DISCIPLINE = {
  Mathematics: MATH_LENSES,
  Physics: EXPERIMENTAL_LENSES,
  'Computer Science': CS_LENSES,
  Biology: EXPERIMENTAL_LENSES,
  'Environmental Science': EXPERIMENTAL_LENSES,
  'Social Science': SOCIAL_LENSES,
}

export const NARROWING_EXAMPLES = [
  {
    id: 'math-paths',
    label: 'Mathematics / counting',
    badge: 'WORKED EXAMPLE',
    discipline: 'Mathematics',
    state: {
      discipline: 'Mathematics',
      interest: 'graph theory and counting',
      object: 'restricted lattice paths',
      lens: 'structure',
      boundary: 'paths of length n on a bounded grid',
      chosenDirectionId: '',
    },
  },
  {
    id: 'cs-compression',
    label: 'Computer Science / compression',
    badge: 'WORKED EXAMPLE',
    discipline: 'Computer Science',
    state: {
      discipline: 'Computer Science',
      interest: 'image compression and classifiers',
      object: 'compressed images fed to a small classifier',
      lens: 'robustness',
      boundary: 'one public image benchmark with a fixed model family',
      chosenDirectionId: '',
    },
  },
  {
    id: 'bio-antibiotic',
    label: 'Biology / growth',
    badge: 'WORKED EXAMPLE',
    discipline: 'Biology',
    state: {
      discipline: 'Biology',
      interest: 'antibiotic exposure',
      object: 'bacterial growth after a short antibiotic pulse',
      lens: 'measurement',
      boundary: 'one laboratory strain under controlled culture conditions',
      chosenDirectionId: '',
    },
  },
  {
    id: 'env-heat',
    label: 'Environmental / urban heat',
    badge: 'WORKED EXAMPLE',
    discipline: 'Environmental Science',
    state: {
      discipline: 'Environmental Science',
      interest: 'urban heat',
      object: 'afternoon surface temperature over different surface materials',
      lens: 'comparison',
      boundary: 'one neighborhood using publicly available measurements',
      chosenDirectionId: '',
    },
  },
  {
    id: 'social-commute',
    label: 'Social Science / commute',
    badge: 'WORKED EXAMPLE',
    discipline: 'Social Science',
    state: {
      discipline: 'Social Science',
      interest: 'school stress',
      object: 'reported stress after the morning commute',
      lens: 'operationalization',
      boundary: 'students at one school during a two-week window',
      chosenDirectionId: '',
    },
  },
  {
    id: 'physics-fluid',
    label: 'Physics / fluids',
    badge: 'WORKED EXAMPLE',
    discipline: 'Physics',
    state: {
      discipline: 'Physics',
      interest: 'fluid behavior',
      object: 'oscillation of a wake behind a simple obstacle',
      lens: 'parameter',
      boundary: 'one flow setting in a low-cost or simulated channel',
      chosenDirectionId: '',
    },
  },
]

export function getLenses(discipline) {
  return LENSES_BY_DISCIPLINE[discipline] || []
}

export function getLens(discipline, lensId) {
  return getLenses(discipline).find((item) => item.id === lensId) || null
}

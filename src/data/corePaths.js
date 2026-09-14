export const CORE_PATHS = [
  {
    id: 'direction', label: 'I have an interest', action: 'Find a direction', path: '/topic-narrowing',
    description: 'Choose one object, one lens, and a boundary.',
    title: 'Make the topic smaller.',
    example: 'Tree cover and summer surface temperatures in one city.',
    fields: [['Object', 'Neighborhood tree cover'], ['Lens', 'Relationship to surface temperature'], ['Boundary', 'One city · one summer']],
    note: 'A direction tells you where to look.',
  },
  {
    id: 'question', label: 'I need a question', action: 'Shape a question', path: '/research-question-builder',
    description: 'Decide what you can compare, measure, or prove.',
    title: 'Ask something you can test.',
    example: 'Within one city, how is summer surface temperature associated with tree cover?',
    fields: [['Compare', 'Areas with different canopy cover'], ['Measure', 'Surface temperature'], ['Check', 'Other differences between neighborhoods']],
    note: 'A question tells you what evidence to seek.',
  },
  {
    id: 'investigation', label: 'I’m ready to investigate', action: 'Plan the first test', path: '/investigation-planner',
    description: 'Choose evidence, a comparison, and a first action.',
    title: 'Start with one small test.',
    example: 'Inspect a small sample from matched canopy and temperature datasets.',
    fields: [['First action', 'Check the dates and spatial resolution'], ['Evidence', 'A plot, source notes, and missing-data checks'], ['Limit', 'An association does not establish a cause']],
    note: 'Keep the result, including what did not work.',
  },
]

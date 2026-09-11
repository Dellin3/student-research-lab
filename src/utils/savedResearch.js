export const SAVED_RESEARCH_KEYS = [
  'research-starter-worksheet',
  'researchStarterLab.questionBuilder.v1',
  'researchStarterLab.topicNarrowing.v1',
  'researchStarterLab.topicNarrowing.handoff.v1',
  'researchStarterLab.investigationPlanner.v1',
]
// Preserve exact stored values, including malformed or older draft formats.
export function collectSavedResearch(storage) {
  return Object.fromEntries(SAVED_RESEARCH_KEYS.flatMap(key => {
    const value = storage.getItem(key)
    return value === null ? [] : [[key, value]]
  }))
}

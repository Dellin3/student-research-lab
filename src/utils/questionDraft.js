import { EMPTY_BUILDER_STATE, STAGES } from '../data/questionBuilderPresets.js'

// A confirmed new direction starts clean: do not reuse evidence from an unrelated draft.
export function restoreQuestionDraft(saved, transferred) {
  if (transferred) return { state: { ...EMPTY_BUILDER_STATE, ...transferred }, stageIndex: 1 }
  const source = saved && typeof saved === 'object' ? saved : {}
  const state = Object.fromEntries(Object.keys(EMPTY_BUILDER_STATE).map(key => [key, typeof source[key] === 'string' ? source[key] : EMPTY_BUILDER_STATE[key]]))
  const stageIndex = Number.isInteger(source.stageIndex) && source.stageIndex >= 0 && source.stageIndex < STAGES.length ? source.stageIndex : 0
  return { state, stageIndex }
}

export const ELIGIBILITY_FILTERS = [
  ['all', 'All eligibility groups'],
  ['international', 'International applicants (check conditions)'],
  ['us-school', 'U.S. school / residence required'],
  ['us-status', 'U.S. citizenship / permanent residency required'],
]
export const FORMAT_FILTERS = ['All formats', 'In person', 'Remote', 'Mixed / varies']
// Broad groups derived from each program's official subject description.
export const SUBJECT_FILTERS = [
  ['all', 'All subjects'],
  ['mathematics', 'Mathematics'],
  ['sciences', 'Natural sciences'],
  ['engineering', 'Engineering & computing'],
  ['social-humanities', 'Social sciences & humanities'],
]
export const SUBJECT_LABELS = Object.fromEntries(SUBJECT_FILTERS.slice(1))
const MAX_LISTED_PROGRAMS = 50
const normalize = value => String(value).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function filterPrograms(programs, { q = '', eligibility = 'all', format = 'All formats', subject = 'all', ids = null } = {}) {
  const terms = normalize(q).trim().split(/\s+/).filter(Boolean)
  const listed = ids ? new Set(ids) : null
  return programs.filter(item =>
    (!listed || listed.has(item.id)) &&
    (subject === 'all' || (item.fields || []).includes(subject)) &&
    (eligibility === 'all' || item.eligibilityGroup === eligibility) &&
    (format === 'All formats' || item.format === format) &&
    terms.every(term => normalize([item.title, item.fullName || '', item.organization, item.subject, item.type, item.location, item.audience, item.eligibility, item.eligibilityLabel, item.description, ...(item.fields || []).map(field => SUBJECT_LABELS[field] || '')].join(' ')).includes(term))
  )
}

// A shared list arrives as ?programs=id,id. Unknown and repeated ids are ignored.
export function parseProgramIds(value, programs) {
  if (typeof value !== 'string' || !value.trim()) return []
  const known = new Set(programs.map(item => item.id))
  const ids = []
  for (const part of value.split(',')) {
    const id = part.trim()
    if (known.has(id) && !ids.includes(id)) ids.push(id)
    if (ids.length >= MAX_LISTED_PROGRAMS) break
  }
  return ids
}

export function programListPath(ids) {
  return `/resources?programs=${ids.map(encodeURIComponent).join(',')}`
}

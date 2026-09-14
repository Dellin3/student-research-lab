export const ELIGIBILITY_FILTERS = [
  ['all', 'All eligibility groups'],
  ['international', 'International applicants (check conditions)'],
  ['us-school', 'U.S. school / residence required'],
  ['us-status', 'U.S. citizenship / permanent residency required'],
]
export const FORMAT_FILTERS = ['All formats', 'In person', 'Remote', 'Mixed / varies']
const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export function filterPrograms(programs, { q = '', eligibility = 'all', format = 'All formats' } = {}) {
  const terms = normalize(q).trim().split(/\s+/).filter(Boolean)
  return programs.filter(item =>
    (eligibility === 'all' || item.eligibilityGroup === eligibility) &&
    (format === 'All formats' || item.format === format) &&
    terms.every(term => normalize([item.title, item.fullName || '', item.organization, item.subject, item.type, item.location, item.audience, item.eligibility, item.eligibilityLabel].join(' ')).includes(term))
  )
}

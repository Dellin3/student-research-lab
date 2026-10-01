export const contact = {
  name: 'Zhuoxuan Li',
  email: 'Zhuoxuan780123@gmail.com',
}

export const feedbackCategories = [
  { value: 'content', label: 'Content or explanation' },
  { value: 'bug', label: 'Website bug' },
  { value: 'idea', label: 'Suggestion' },
  { value: 'other', label: 'Other' },
]

// Keep only the page path; research drafts, auth tokens, and query text stay private.
export function feedbackPagePath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || [...value].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return ''
  return value.split(/[?#]/, 1)[0].slice(0, 1000)
}

export function feedbackEmailBody({ category, message, name, email, page }) {
  const label = feedbackCategories.find(item => item.value === category)?.label || 'Website feedback'
  const details = [
    'Research Starter Lab',
    `Topic: ${label}`,
    page ? `Page: ${feedbackPagePath(page)}` : '',
    name.trim() ? `Name: ${name.trim()}` : '',
    email.trim() ? `Reply to: ${email.trim()}` : '',
  ].filter(Boolean)
  return [...details, '', message.trim()].join('\n')
}
